import {
  commandsMapping,
  events,
  green,
  MinskyProcessPayload,
  MINSKY_HTTP_SERVER_PORT,
  MINSKY_SYSTEM_BINARY_PATH,
  MINSKY_SYSTEM_HTTP_SERVER_PATH,
  newLineCharacter,
  red,
  unExposedTerminalCommands,
  USE_MINSKY_SYSTEM_BINARY,
} from '@minsky/shared';
import { ChildProcess, spawn } from 'child_process';
import * as debug from 'debug';
import { dialog, ipcMain } from 'electron';
import * as log from 'electron-log';
import { MessageBoxSyncOptions } from 'electron/main';
import {
  createReadStream,
  createWriteStream,
  readFileSync,
  ReadStream,
  WriteStream,
} from 'fs';
import * as JSONStream from 'JSONStream';
import { join } from 'path';
import { StoreManager } from './storeManager';
import { WindowManager } from './windowManager';

const logError = debug('minsky:electron_error');

export class RestServiceManager {
  static minskyProcess: ChildProcess;
  static minskyHttpServer: ChildProcess;
  static currentMinskyModelFilePath: string;
  static isFirstStart = true;
  private static isRecording = false;
  private static recordingWriteStream: WriteStream;
  private static recordingReadStream: ReadStream;
  private static recordingFilePath: string;
  private static JSONStreamWriter;

  private static lastMouseMovePayload: MinskyProcessPayload = null;
  private static lastModelMoveToPayload: MinskyProcessPayload = null;
  private static payloadDataQueue: Array<MinskyProcessPayload> = [];
  private static runningCommand = false;

  private static processCommandsInQueueNew() {
    // Should be on a separate thread......? Janak
    if (!this.runningCommand && this.payloadDataQueue.length > 0) {
      const nextPayload = this.payloadDataQueue.shift();

      if (nextPayload.command === commandsMapping.mousemove) {
        this.lastMouseMovePayload = null;
      } else if (nextPayload.command === commandsMapping.MOVE_TO) {
        this.lastModelMoveToPayload = null;
      }
      this.runningCommand = true;
      this.handleMinskyPayload(nextPayload);
    }
  }

  public static handleMinskyProcess(payload: MinskyProcessPayload) {
    const wasQueueEmpty = this.payloadDataQueue.length === 0;
    const isStartProcessCommand =
      payload.command === commandsMapping.START_MINSKY_PROCESS;
    if (isStartProcessCommand) {
      this.startMinskyProcess(
        USE_MINSKY_SYSTEM_BINARY
          ? { ...payload, filePath: MINSKY_SYSTEM_BINARY_PATH }
          : payload
      );
      return;
    } else {
      if (!this.minskyProcess) {
        logError('Minsky process is not running yet.');
        return;
      }
      if (payload.command === commandsMapping.mousemove) {
        if (this.lastMouseMovePayload !== null) {
          this.lastMouseMovePayload.mouseX = payload.mouseX;
          this.lastMouseMovePayload.mouseY = payload.mouseY;
        } else {
          this.lastMouseMovePayload = payload;
          this.payloadDataQueue.push(payload);
        }
        this.lastModelMoveToPayload = null;
      } else if (payload.command === commandsMapping.MOVE_TO) {
        if (this.lastModelMoveToPayload !== null) {
          this.lastModelMoveToPayload.mouseX = payload.mouseX;
          this.lastModelMoveToPayload.mouseY = payload.mouseY;
        } else {
          this.lastModelMoveToPayload = payload;
          this.payloadDataQueue.push(payload);
        }
        this.lastMouseMovePayload = null;
      } else {
        this.lastMouseMovePayload = null;
        this.lastMouseMovePayload = null;
        this.payloadDataQueue.push(payload);
      }
    }
    if (!this.runningCommand && wasQueueEmpty) {
      this.processCommandsInQueueNew();
    }
  }

  private static startMinskyProcess(payload: MinskyProcessPayload) {
    if (this.minskyProcess) {
      this.minskyProcess.stdout.emit('close');
      this.minskyProcess = null;
      this.payloadDataQueue = [];
      this.lastMouseMovePayload = null;
      this.lastModelMoveToPayload = null;
    }
    try {
      if (this.isFirstStart) {
        this.isFirstStart = false;
      }

      const { filePath, showServiceStartedDialog = true } = payload;

      if (!USE_MINSKY_SYSTEM_BINARY) {
        StoreManager.store.set('minskyRESTServicePath', filePath);
      }

      this.minskyProcess = spawn(filePath);
      if (this.minskyProcess) {
        this.minskyProcess.stdout.on('data', (data) => {
          const stdout = data.toString().trim();
          const message = `stdout: ${stdout}`;
          log.info(message);

          this.emitReplyEvent(message);

          if (stdout.includes('renderFrame=>')) {
            this.runningCommand = false;
            this.processCommandsInQueueNew();
          }
        });

        this.minskyProcess.stderr.on('data', (data) => {
          const message = `stderr: ${data}`;
          log.info(red(message));

          this.processCommandsInQueueNew();

          this.emitReplyEvent(message);
        });

        this.minskyProcess.on('error', (error) => {
          const message = `error: ${error.message}`;
          log.info(red(message));

          this.emitReplyEvent(message);
        });

        this.minskyProcess.on('close', (code) => {
          log.info(red(`child process exited with code ${code}`));
        });

        if (!showServiceStartedDialog) {
          return;
        }
        dialog.showMessageBoxSync(WindowManager.getMainWindow(), {
          type: 'info',
          title: 'Minsky Service Started',
          message: 'You can now choose model files to be loaded',
        });
        this.runningCommand = false;
        this.processCommandsInQueueNew();
      }
    } catch {
      dialog.showErrorBox('Execution error', 'Could not execute chosen file');
      this.minskyProcess = null;
    }
  }

  private static handleMinskyPayload(payload: MinskyProcessPayload) {
    if (this.minskyProcess) {
      switch (payload.command) {
        case commandsMapping.RECORD:
          this.handleRecord();
          this.runningCommand = false;
          break;

        case commandsMapping.RECORDING_REPLAY:
          this.runningCommand = false;
          this.handleRecordingReplay();
          break;

        default:
          this.executeCommandOnMinskyServer(this.minskyProcess, payload);
          break;
      }
    } else {
      logError('Please select the minsky executable first...');
    }
  }

  private static emitReplyEvent(message: string) {
    WindowManager.activeWindows.forEach((aw) => {
      aw.context.webContents.send(events.ipc.MINSKY_PROCESS_REPLY, message);
    });
  }

  private static handleRecordingReplay() {
    this.stopRecording();

    (async () => {
      const replayRecordingDialog = await dialog.showOpenDialog({
        filters: [
          { extensions: ['json'], name: 'JSON' },
          { extensions: ['*'], name: 'All Files' },
        ],
      });

      if (replayRecordingDialog.canceled) {
        return;
      }

      const positiveResponseText = 'Yes';
      const negativeResponseText = 'No';
      const cancelResponseText = 'Cancel';

      const options: MessageBoxSyncOptions = {
        buttons: [
          positiveResponseText,
          negativeResponseText,
          cancelResponseText,
        ],
        message: 'Do you want to save the current model?',
        title: 'Save ?',
      };

      const index = dialog.showMessageBoxSync(options);

      if (options.buttons[index] === positiveResponseText) {
        const saveDialog = await dialog.showSaveDialog({});

        if (saveDialog.canceled) {
          return;
        }

        this.handleMinskyProcess({
          command: `${commandsMapping.SAVE} "${saveDialog.filePath}"`,
        });

        this.runningCommand = false;
        this.replay(replayRecordingDialog);
      }

      if (options.buttons[index] === negativeResponseText) {
        this.replay(replayRecordingDialog);
      }

      return;
    })();
  }

  private static replay(replayRecordingDialog: Electron.OpenDialogReturnValue) {
    this.handleMinskyProcess({
      command: commandsMapping.START_MINSKY_PROCESS,
      filePath: StoreManager.store.get('minskyRESTServicePath'),
      showServiceStartedDialog: false,
    });
    this.runningCommand = false;

    this.recordingReadStream = createReadStream(
      replayRecordingDialog.filePaths[0]
    );
    const replayFile = readFileSync(replayRecordingDialog.filePaths[0], {
      encoding: 'utf8',
      flag: 'r',
    });

    JSON.parse(replayFile).forEach((line) => {
      this.handleMinskyProcess({
        command: line.command,
      });
    });

    this.recordingReadStream.close();
    this.recordingReadStream = null;
  }

  private static record(command: string) {
    const payload = { command: command, executedAt: Date.now() };

    if (!this.recordingWriteStream) {
      this.recordingWriteStream = createWriteStream(this.recordingFilePath);
      this.JSONStreamWriter = JSONStream.stringify();
      this.JSONStreamWriter.pipe(this.recordingWriteStream);
    }

    const recordIgnoreCommands = [
      // 'mouseMove' ||
      'getItemAt' ||
        'getItemAtFocus' ||
        'getWireAt' ||
        commandsMapping.START_MINSKY_PROCESS ||
        commandsMapping.RECORD ||
        commandsMapping.RECORDING_REPLAY,
    ];

    if (!recordIgnoreCommands.find((cmd) => command.includes(cmd)))
      this.JSONStreamWriter.write(payload);
  }

  private static stopRecording() {
    this.isRecording = false;

    if (this.recordingWriteStream) {
      if (this.JSONStreamWriter) {
        this.JSONStreamWriter.end();
        this.JSONStreamWriter = null;
      }
      this.recordingWriteStream.close();
      this.recordingWriteStream = null;
    }
  }

  private static handleRecord() {
    if (this.isRecording) {
      this.stopRecording();
      return;
    }

    (async () => {
      const saveRecordingDialog = await dialog.showSaveDialog({
        properties: ['showOverwriteConfirmation', 'createDirectory'],
        filters: [
          { extensions: ['json'], name: 'JSON' },
          { extensions: ['*'], name: 'All Files' },
        ],
      });
      this.isRecording = true;

      this.recordingFilePath = saveRecordingDialog.filePath;
    })();
  }

  private static executeCommandOnMinskyServer(
    minskyProcess: ChildProcess,
    payload: MinskyProcessPayload
  ) {
    let stdinCommand = null;
    switch (payload.command) {
      case commandsMapping.LOAD:
        stdinCommand = `${payload.command} "${payload.filePath}"`;

        this.currentMinskyModelFilePath = payload.filePath;

        ipcMain.emit(events.ipc.ADD_RECENT_FILE, null, payload.filePath);
        break;

      case commandsMapping.SAVE:
        stdinCommand = `${payload.command} "${payload.filePath}"`;

        this.currentMinskyModelFilePath = payload.filePath;

        ipcMain.emit(events.ipc.ADD_RECENT_FILE, null, payload.filePath);
        break;

      case commandsMapping.mousemove:
        stdinCommand = `${payload.command} [${payload.mouseX}, ${payload.mouseY}]`;
        break;

      case commandsMapping.MOVE_TO:
        stdinCommand = `${payload.command} [${payload.mouseX}, ${payload.mouseY}]`;
        break;

      case commandsMapping.mousedown:
        stdinCommand = `${payload.command} [${payload.mouseX}, ${payload.mouseY}]`;
        break;

      case commandsMapping.mouseup:
        stdinCommand = `${payload.command} [${payload.mouseX}, ${payload.mouseY}]`;
        break;

      case commandsMapping.SET_GODLEY_ICON_RESOURCE:
        stdinCommand = `${payload.command} "${join(
          __dirname,
          'assets/godley.svg'
        )}"`;
        break;

      case commandsMapping.SET_GROUP_ICON_RESOURCE:
        stdinCommand = `${payload.command} "${join(
          __dirname,
          'assets/group.svg'
        )}"`;
        break;

      default:
        stdinCommand = payload.command;
        break;
    }
    if (stdinCommand) {
      log.silly(stdinCommand);

      const miscCommand = stdinCommand + newLineCharacter;
      const renderCommand = this.getRenderCommand();

      if (this.isRecording) {
        this.record(stdinCommand);
      }

      minskyProcess.stdin.write(miscCommand);
      minskyProcess.stdin.write(renderCommand);
    }
  }

  private static getRenderCommand() {
    const {
      leftOffset,
      canvasWidth,
      canvasHeight,
      activeWindows,
      electronTopOffset,
    } = WindowManager;

    const mainWindowId = activeWindows.get(1).windowId;

    const renderCommand =
      `${commandsMapping.RENDER_FRAME} [${mainWindowId}, ${leftOffset}, ${electronTopOffset}, ${canvasWidth}, ${canvasHeight}]` +
      newLineCharacter;

    log.info(renderCommand);

    return renderCommand;
  }

  static onGetMinskyCommands(event: Electron.IpcMainEvent) {
    let listOfCommands = [...unExposedTerminalCommands];

    const getMinskyCommandsProcess = spawn(
      StoreManager.store.get('minskyRESTServicePath')
    );

    getMinskyCommandsProcess.stdin.write(
      commandsMapping.LIST + newLineCharacter
    );

    setTimeout(() => {
      getMinskyCommandsProcess.stdout.emit('close');
    }, 1000);

    getMinskyCommandsProcess.stdout
      .on('data', (data) => {
        listOfCommands = [
          ...listOfCommands,
          ...data.toString().trim().split(newLineCharacter),
        ];
      })
      .on('error', (error) => {
        log.error(`error: ${error.message}`);
      })
      .on('close', (code) => {
        log.info(
          `"get-minsky-commands" child process exited with code ${code}`
        );
        event.returnValue = listOfCommands.sort();
      });
  }

  static async toggleMinskyService() {
    try {
      const _dialog = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'minsky-RESTService', extensions: ['*'] }],
      });

      if (_dialog.canceled) {
        return;
      }

      this.startMinskyService(_dialog.filePaths[0]);
    } catch (error) {
      logError(error);
    }
  }

  static startMinskyService(filePath: string) {
    const initPayload: MinskyProcessPayload = {
      command: commandsMapping.START_MINSKY_PROCESS,
      filePath,
    };

    this.handleMinskyProcess(initPayload);

    const setGroupIconResource = () => {
      const groupIconResourcePayload: MinskyProcessPayload = {
        command: commandsMapping.SET_GROUP_ICON_RESOURCE,
      };

      this.handleMinskyProcess(groupIconResourcePayload);
    };

    const setGodleyIconResource = () => {
      const godleyIconPayload: MinskyProcessPayload = {
        command: commandsMapping.SET_GODLEY_ICON_RESOURCE,
      };

      this.handleMinskyProcess(godleyIconPayload);
    };

    setGodleyIconResource();
    setGroupIconResource();
  }

  static async getCommandValue(payload: MinskyProcessPayload): Promise<string> {
    try {
      this.handleMinskyProcess(payload);

      if (!this.minskyProcess) {
        throw new Error('Minsky Process is not initialized');
      }

      const res = await Promise.race([
        new Promise((resolve) => {
          this.minskyProcess.stdout.on('data', (data: Buffer) => {
            let response = data.toString();

            if (response.includes(newLineCharacter)) {
              response = response
                .split(newLineCharacter)
                .filter((r) => Boolean(r))
                .find((r) => r.includes(payload.command.split(' ')[0]));
            }

            if (response && response.includes(payload.command.split(' ')[0])) {
              return resolve(response.split('=>').pop().trim());
            }
          });
        }),
        new Promise((resolve, reject) => {
          setTimeout(function () {
            return reject(`command: "${payload.command}" Timed out`);
          }, 4000);
        }),
      ]);

      console.log(green(`command: ${payload.command}, value:${res}`));
      return res as string;
    } catch (error) {
      console.error(
        '🚀 ~ file: state-management.service.ts ~ line 118 ~ StateManagementService ~ getCommandValue ~ error',
        error
      );

      throw error;
    }
  }

  static startHttpServer() {
    this.minskyHttpServer = spawn(`${MINSKY_SYSTEM_HTTP_SERVER_PATH}`, [
      `${MINSKY_HTTP_SERVER_PORT}`,
    ]);

    console.log(
      green(`Minsky Http Server started on port ${MINSKY_HTTP_SERVER_PORT}`)
    );

    this.minskyHttpServer.stdout
      .on('data', (data) => {
        log.info(`http: ${data}`);
      })
      .on('error', (error) => {
        log.error(`error: ${error.message}`);
      })
      .on('close', (code) => {
        log.info(`"http-server" child process exited with code ${code}`);
      });
  }
}
