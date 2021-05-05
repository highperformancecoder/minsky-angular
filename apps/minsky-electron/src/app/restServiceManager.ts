import {
  commandsMapping,
  events,
  MinskyProcessPayload,
  minskyProcessReplyIndicators,
  newLineCharacter,
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
import { default as PQueue } from 'p-queue';
import { join } from 'path';
import { StoreManager } from './storeManager';
import { WindowManager } from './windowManager';
const logError = debug('minsky:electron_error');

export class RestServiceManager {
  static minskyProcess: ChildProcess;
  static currentMinskyModelFilePath: string;
  static isFirstStart = true;
  private static queue = new PQueue({
    concurrency: 1,
    autoStart: false,
    interval: 15,
    intervalCap: 1,
  });
  private static isRecording = false;
  private static recordingWriteStream: WriteStream;
  private static recordingReadStream: ReadStream;
  private static recordingFilePath: string;
  private static JSONStreamWriter;
  static isCanvasEdited = false;

  static handleMinskyProcess(payload: MinskyProcessPayload) {
    // TODO:: Add Logic to merge consecutive mouse move evets
    // If queue already has a move move event, just change the coordinates and do not add new event to the queue
    // Store index of / pointer to mouse move event in the queue
    // we can do this only with consecutive mouse move events
    if (this.minskyProcess) {
      switch (payload.command) {
        case commandsMapping.START_MINSKY_PROCESS:
          this.minskyProcess.stdout.emit('close');
          this.minskyProcess = null;
          this.queue.clear();
          this.queue.removeAllListeners();

          this.handleMinskyProcess(payload);
          break;

        case commandsMapping.RECORD:
          this.handleRecord();

          break;

        case commandsMapping.RECORDING_REPLAY:
          this.handleRecordingReplay();
          break;

        default:
          this.executeCommandOnMinskyServer(this.minskyProcess, payload);
          break;
      }
    } else {
      if (payload.command === commandsMapping.START_MINSKY_PROCESS) {
        try {
          if (this.isFirstStart) {
            this.isFirstStart = false;
            this.queue.start();
          }

          const { filePath, showServiceStartedDialog = true } = payload;
          StoreManager.store.set('minskyRESTServicePath', filePath);

          this.minskyProcess = spawn(filePath);
          if (this.minskyProcess) {
            this.minskyProcess.stdout.once('data', () => {
              this.queue.on('next', () => {
                this.queue.pause();
              });
            });

            this.minskyProcess.stdout.on('data', (data) => {
              const stdout = data.toString();

              const message = `stdout: ${stdout}`;
              log.info(message);

              this.emitReplyEvent(message);

              if (stdout.includes('=>')) {
                this.queue.start();
              }

              RestServiceManager.handleStdout(stdout);
            });

            this.minskyProcess.stderr.on('data', (data) => {
              const message = `stderr: ${data}`;
              log.info(message);

              this.queue.start();

              this.emitReplyEvent(message);
            });

            this.minskyProcess.on('error', (error) => {
              const message = `error: ${error.message}`;
              log.info(message);

              this.emitReplyEvent(message);
            });

            this.minskyProcess.on('close', (code) => {
              log.info(`child process exited with code ${code}`);
            });

            if (!showServiceStartedDialog) {
              return;
            }
            dialog.showMessageBoxSync(WindowManager.getMainWindow(), {
              type: 'info',
              title: 'Minsky Service Started',
              message: 'You can now choose model files to be loaded',
            });
          }
        } catch {
          dialog.showErrorBox(
            'Execution error',
            'Could not execute chosen file'
          );
          this.minskyProcess = null;
        }
      } else {
        logError('Please select the minsky executable first...');
      }
    }
  }

  private static emitReplyEvent(message: string) {
    WindowManager.activeWindows.forEach((aw) => {
      aw.context.webContents.send(events.ipc.MINSKY_PROCESS_REPLY, message);
    });
  }

  private static handleStdout(stdout: string) {
    if (stdout.includes(minskyProcessReplyIndicators.BOOKMARK_LIST)) {
      // handle bookmarks
      const _event = null;
      ipcMain.emit(events.ipc.POPULATE_BOOKMARKS, _event, stdout);
    } else if (stdout.includes(commandsMapping.DIMENSIONAL_ANALYSIS)) {
      // handle dimensional analysis
      if (minskyProcessReplyIndicators.DIMENSIONAL_ANALYSIS) {
        dialog.showMessageBoxSync(WindowManager.getMainWindow(), {
          type: 'info',
          title: 'Dimensional Analysis',
          message: 'Dimensional Analysis Passed',
        });
      } else {
        dialog.showErrorBox('Dimensional Analysis Failed', stdout);
      }
    } else if (stdout.includes(minskyProcessReplyIndicators.EDITED)) {
      // handle edited
      this.isCanvasEdited = stdout.split('=>').pop().trim() == 'true';
    }
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

    this.recordingReadStream = createReadStream(
      replayRecordingDialog.filePaths[0]
    );
    const replayFile = readFileSync(replayRecordingDialog.filePaths[0], {
      encoding: 'utf8',
      flag: 'r',
    });

    JSON.parse(replayFile).forEach((line) => {
      this.executeCommandOnMinskyServer(this.minskyProcess, {
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
        stdinCommand = `${payload.command} [${
          payload.mouseX - WindowManager.leftOffset
        }, ${payload.mouseY - WindowManager.topOffset}]`;
        break;

      case commandsMapping.mousedown:
        stdinCommand = `${payload.command} [${
          payload.mouseX - WindowManager.leftOffset
        }, ${payload.mouseY - WindowManager.topOffset}]`;
        break;

      case commandsMapping.mouseup:
        stdinCommand = `${payload.command} [${
          payload.mouseX - WindowManager.leftOffset
        }, ${payload.mouseY - WindowManager.topOffset}]`;
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

      RestServiceManager.handleMarkEdited(stdinCommand);

      (async () => {
        await this.queue.add(() => {
          minskyProcess.stdin.write(miscCommand);
        });
      })();

      (async () => {
        this.queue.add(() => {
          minskyProcess.stdin.write(renderCommand);
        });
      })();
    }
  }

  private static handleMarkEdited(command: string) {
    const markEditIgnore = [
      // 'mouseMove' ||
      'getItemAt' ||
        'getItemAtFocus' ||
        'getWireAt' ||
        commandsMapping.START_MINSKY_PROCESS ||
        commandsMapping.RECORD ||
        commandsMapping.RECORDING_REPLAY,
      commandsMapping.MARK_EDITED,
      commandsMapping.EDITED,
      commandsMapping.RENDER_FRAME,
    ];

    if (
      !this.isCanvasEdited &&
      !markEditIgnore.find((c) => command.includes(c))
    ) {
      this.handleMinskyProcess({ command: commandsMapping.MARK_EDITED });
      this.handleMinskyProcess({ command: commandsMapping.EDITED });
    }
  }

  private static getRenderCommand() {
    const {
      leftOffset,
      topOffset,
      canvasWidth,
      canvasHeight,
      activeWindows,
    } = WindowManager;

    
    const mainWindowId = activeWindows.get(1).windowId;

    const renderCommand =
      `${commandsMapping.RENDER_FRAME} [${mainWindowId}, ${leftOffset}, ${topOffset}, ${canvasWidth}, ${canvasHeight}]` +
      newLineCharacter;

    return renderCommand;
  }

  static returnCommandOutput(event: Electron.IpcMainEvent, command: string) {
    let output: string = null;

    const minskyProcess = spawn(
      StoreManager.store.get('minskyRESTServicePath')
    );

    minskyProcess.stdin.write(command + newLineCharacter);

    setTimeout(() => {
      minskyProcess.stdout.emit('close');
    }, 1000);

    minskyProcess.stdout
      .on('data', (data: Buffer) => {
        output = data.toString().trim().split('=>').pop();
      })
      .on('error', (error) => {
        log.error(`error: ${error.message}`);
      })
      .on('close', (code) => {
        log.info(
          `"returnCommandOutput" child process exited with code ${code}`
        );
        event.returnValue = output;
      });
  }

  static onGetMinskyCommands(event: Electron.IpcMainEvent) {
    // add non exposed commands here to get intellisense on the terminal popup
    let listOfCommands = [
      '/minsky/model/cBounds',
      '/minsky/model/zoomFactor',
      '/minsky/model/relZoom',
      '/minsky/model/setZoom',
      '/minsky/canvas/itemFocus/initValue',
      '/minsky/canvas/itemFocus/tooltip',
      '/minsky/canvas/itemFocus/detailedText',
      '/minsky/canvas/itemFocus/sliderMax',
      '/minsky/canvas/itemFocus/sliderMin',
      '/minsky/canvas/itemFocus/sliderStep',
      '/minsky/canvas/itemFocus/sliderStepRel',
      '/minsky/canvas/itemFocus/rotation',
      '/minsky/canvas/itemFocus/setUnits',
    ];

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
        event.returnValue = listOfCommands;
      });
  }

  static async toggleMinskyService(event: Electron.IpcMainEvent) {
    try {
      const _dialog = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'minsky-RESTService', extensions: ['*'] }],
      });

      if (_dialog.canceled) {
        event.returnValue = false;
        return;
      }

      this.startMinskyService(_dialog.filePaths[0]);

      event.returnValue = true;
    } catch (error) {
      logError(error);
      event.returnValue = false;
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
}
