import {
  commandsMapping,
  events,
  green,
  MinskyProcessPayload,
  MINSKY_HTTP_SERVER_PORT,
  MINSKY_SYSTEM_HTTP_SERVER_PATH,
  red,
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
import { HttpManager } from './httpManager';
import { StoreManager } from './storeManager';
import { WindowManager } from './windowManager';

const logError = debug('minsky:electron_error');

export class RestServiceManager {
  static minskyHttpServer: ChildProcess;
  static currentMinskyModelFilePath: string;
  // static isFirstStart = true;
  private static isRecording = false;
  private static recordingWriteStream: WriteStream;
  private static recordingReadStream: ReadStream;
  private static recordingFilePath: string;
  private static JSONStreamWriter;

  private static lastMouseMovePayload: MinskyProcessPayload = null;
  private static lastModelMoveToPayload: MinskyProcessPayload = null;
  private static payloadDataQueue: Array<MinskyProcessPayload> = [];
  private static runningCommand = false;

  private static async processCommandsInQueueNew() {
    // Should be on a separate thread......? Janak
    if (!this.runningCommand && this.payloadDataQueue.length > 0) {
      const nextPayload = this.payloadDataQueue.shift();

      if (nextPayload.command === commandsMapping.mousemove) {
        this.lastMouseMovePayload = null;
      } else if (nextPayload.command === commandsMapping.MOVE_TO) {
        this.lastModelMoveToPayload = null;
      }
      this.runningCommand = true;
      return await this.handleMinskyPayload(nextPayload);
    }
  }

  private static async resumeQueueProcessing() {
    this.runningCommand = false;
    await this.processCommandsInQueueNew();
  }

  public static async handleMinskyProcess(
    payload: MinskyProcessPayload
  ): Promise<unknown> {
    const wasQueueEmpty = this.payloadDataQueue.length === 0;
    // const isStartProcessCommand =
    //   payload.command === commandsMapping.START_MINSKY_PROCESS;
    // if (isStartProcessCommand) {
    //   this.startMinskyProcess(
    //     USE_MINSKY_SYSTEM_BINARY
    //       ? { ...payload, filePath: MINSKY_SYSTEM_BINARY_PATH }
    //       : payload
    //   );
    //   return;
    // } else {
    if (payload.command === commandsMapping.mousemove) {
      if (this.lastMouseMovePayload !== null) {
        // console.log("Merging mouse move commands");
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
      this.lastModelMoveToPayload = null;
      this.payloadDataQueue.push(payload);
    }
    // }
    if (!this.runningCommand && wasQueueEmpty) {
      // Control will come here when a new command comes after the whole queue was processed
      return await this.processCommandsInQueueNew();
    }
  }

  private static async startMinskyProcess(payload: MinskyProcessPayload) {
    // if (this.minskyProcess) {
    //   this.minskyProcess.stdout.emit('close');
    //   this.minskyProcess = null;
    // this.payloadDataQueue = [];
    // this.lastMouseMovePayload = null;
    // this.lastModelMoveToPayload = null;
    // }
    // try {
    // if (this.isFirstStart) {
    //   this.isFirstStart = false;
    // }

    // const { filePath, showServiceStartedDialog = true } = payload;

    // if (!USE_MINSKY_SYSTEM_BINARY) {
    //   StoreManager.store.set('minskyRESTServicePath', filePath);
    // }

    // this.minskyProcess = spawn(filePath);

    // if (this.minskyProcess) {
    this.runningCommand = false;
    await this.processCommandsInQueueNew();

    // this.minskyProcess.stdout.on('data', async (data) => {
    //   const stdout = data.toString().trim();
    //   const message = `stdout: ${stdout}`;
    //   log.info(message);

    //   this.emitReplyEvent(message);

    //   // if (stdout.includes('renderFrame=>')) {
    //   this.runningCommand = false;
    //   await this.processCommandsInQueueNew();
    //   // }
    // });

    // this.minskyProcess.stderr.on('data', async (data) => {
    //   const message = `stderr: ${data}`;
    //   log.info(red(message));

    //   await this.processCommandsInQueueNew();

    //   this.emitReplyEvent(message);
    // });

    // this.minskyProcess.on('error', (error) => {
    //   const message = `error: ${error.message}`;
    //   log.info(red(message));

    //   this.emitReplyEvent(message);
    // });

    // this.minskyProcess.on('close', (code) => {
    //   log.info(red(`child process exited with code ${code}`));
    // });

    // if (!showServiceStartedDialog) {
    //   return;
    // }
    // dialog.showMessageBoxSync(WindowManager.getMainWindow(), {
    //   type: 'info',
    //   title: 'Minsky Service Started',
    //   message: 'You can now choose model files to be loaded',
    // });
    // this.runningCommand = false;
    // await this.processCommandsInQueueNew();
    // }
    // } catch {
    //   dialog.showErrorBox('Execution error', 'Could not execute chosen file');
    // this.minskyProcess = null;
    // }
  }

  private static async handleMinskyPayload(payload: MinskyProcessPayload) {
    // if (this.minskyProcess) {
    switch (payload.command) {
      case commandsMapping.RECORD:
        this.handleRecord();
        break;

      case commandsMapping.RECORDING_REPLAY:
        this.handleRecordingReplay();
        break;

      default:
        await this.executeCommandOnMinskyServer(payload);
        break;
    }
    this.resumeQueueProcessing();
    // } else {
    //   logError('Please select the minsky executable first...');
    // }
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

        await this.handleMinskyProcess({
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

  private static async replay(
    replayRecordingDialog: Electron.OpenDialogReturnValue
  ) {
    await this.handleMinskyProcess({
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

    const replayJSON = JSON.parse(replayFile);

    for (const line of replayJSON) {
      await this.handleMinskyProcess({
        command: line.command,
      });
    }

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

  private static async executeCommandOnMinskyServer(
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

      const miscCommand = stdinCommand;
      const renderCommand = this.getRenderCommand();

      if (this.isRecording) {
        this.record(stdinCommand);
      }

      const tsStep0 = Date.now();
      const res = await HttpManager.handleMinskyCommand(miscCommand);
      const tsStep1 = Date.now();
      try {
        await HttpManager.handleMinskyCommand(renderCommand);
      } catch (error) {
        console.error('Error executing command: ', error);
      }
      const tsStep2 = Date.now();
      console.log(
        'Time stamps::',
        (tsStep2 - tsStep1) / 1000,
        (tsStep1 - tsStep0) / 1000,
        tsStep0,
        tsStep1,
        tsStep2
      );
      return res;
      // minskyProcess.stdin.write(miscCommand);
      // minskyProcess.stdin.write(renderCommand);
    }
    console.error('Command was null or undefined');
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

    const renderCommand = `${commandsMapping.RENDER_FRAME} [${mainWindowId},${leftOffset},${electronTopOffset},${canvasWidth},${canvasHeight}]`;

    // log.info(renderCommand);

    return renderCommand;
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

      await this.startMinskyService(_dialog.filePaths[0]);
      return;
    } catch (error) {
      logError(error);
    }
  }

  static async startMinskyService(filePath: string) {
    const initPayload: MinskyProcessPayload = {
      command: commandsMapping.START_MINSKY_PROCESS,
      filePath,
    };

    await this.handleMinskyProcess(initPayload);

    const setGroupIconResource = async () => {
      const groupIconResourcePayload: MinskyProcessPayload = {
        command: commandsMapping.SET_GROUP_ICON_RESOURCE,
      };

      await this.handleMinskyProcess(groupIconResourcePayload);
    };

    const setGodleyIconResource = async () => {
      const godleyIconPayload: MinskyProcessPayload = {
        command: commandsMapping.SET_GODLEY_ICON_RESOURCE,
      };

      await this.handleMinskyProcess(godleyIconPayload);
    };

    await setGodleyIconResource();
    await setGroupIconResource();
  }

  static async getCommandValue(payload: MinskyProcessPayload) {
    // try {
    return await this.handleMinskyProcess(payload);

    // if (!this.minskyProcess) {
    //   throw new Error('Minsky Process is not initialized');
    // }

    //   const res = await Promise.race([
    //     new Promise((resolve) => {
    //       this.minskyProcess.stdout.on('data', (data: Buffer) => {
    //         const stdout = data.toString();

    //         return resolve(
    //           retrieveCommandValueFromStdout({
    //             stdout,
    //             command: payload.command,
    //           })
    //         );
    //       });
    //     }),
    //     new Promise((resolve, reject) => {
    //       setTimeout(function () {
    //         return reject(`command: "${payload.command}" Timed out`);
    //       }, 4000);
    //     }),
    //   ]);

    //   console.log(green(`command: ${payload.command}, value:${res}`));
    //   return res as string;
    // } catch (error) {
    //   console.error(
    //     '🚀 ~ file: state-management.service.ts ~ line 118 ~ StateManagementService ~ getCommandValue ~ error',
    //     error
    //   );

    //   throw error;
    // }
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
        log.error(red(`error: ${error.message}`));
      })
      .on('close', (code) => {
        log.warn(red(`"http-server" child process exited with code ${code}`));
      });
  }
}
