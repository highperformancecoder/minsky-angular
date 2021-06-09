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
  private static isRecording = false;
  private static recordingWriteStream: WriteStream;
  private static recordingReadStream: ReadStream;
  private static recordingFilePath: string;
  private static JSONStreamWriter;

  private static lastMouseMovePayload: MinskyProcessPayload = null;
  private static lastModelMoveToPayload: MinskyProcessPayload = null;
  private static payloadDataQueue: Array<MinskyProcessPayload> = [];
  private static runningCommand = false;
  private static isQueueEnabled = true;
  private static async processCommandsInQueueNew(): Promise<unknown> {
    // Should be on a separate thread......? Janak
    const shouldProcessQueue = this.isQueueEnabled
      ? !this.runningCommand && this.payloadDataQueue.length > 0
      : this.payloadDataQueue.length > 0;

    if (shouldProcessQueue) {
      const nextPayload = this.payloadDataQueue.shift();

      if (nextPayload.command === commandsMapping.mousemove) {
        this.lastMouseMovePayload = null;
      } else if (nextPayload.command === commandsMapping.MOVE_TO) {
        this.lastModelMoveToPayload = null;
      }
      this.runningCommand = true;
      return await this.handleMinskyPayload(nextPayload);
    }
    return;
  }

  private static async resumeQueueProcessing(): Promise<unknown> {
    this.runningCommand = false;
    return await this.processCommandsInQueueNew();
  }

  public static async handleMinskyProcess(
    payload: MinskyProcessPayload
  ): Promise<unknown> {
    const wasQueueEmpty = this.payloadDataQueue.length === 0;
    const shouldProcessQueue = this.isQueueEnabled
      ? !this.runningCommand && wasQueueEmpty
      : this.isQueueEnabled;

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
    if (shouldProcessQueue) {
      // Control will come here when a new command comes after the whole queue was processed
      return await this.processCommandsInQueueNew();
    }
    return;
  }

  private static async handleMinskyPayload(
    payload: MinskyProcessPayload
  ): Promise<unknown> {
    let res = null;

    switch (payload.command) {
      case commandsMapping.RECORD:
        // TODO: make handleRecord return command value
        res = this.handleRecord();
        break;

      case commandsMapping.RECORDING_REPLAY:
        // TODO: make handleRecordingReplay return command value
        res = this.handleRecordingReplay();
        break;

      default:
        res = await this.executeCommandOnMinskyServer(payload);
        break;
    }
    await this.resumeQueueProcessing();

    return res;
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
  ): Promise<unknown> {
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
      const miscCommand = stdinCommand;
      const renderCommand = this.getRenderCommand();

      if (this.isRecording) {
        this.record(stdinCommand);
      }

      // const tsStep0 = Date.now();
      const res = await HttpManager.handleMinskyCommand(miscCommand);
      // const tsStep1 = Date.now();
      try {
        await HttpManager.handleMinskyCommand(renderCommand);
      } catch (error) {
        console.error('Error executing command: ', error);
      }
      // const tsStep2 = Date.now();
      // console.log(
      //   'Time stamps::',
      //   (tsStep2 - tsStep1) / 1000,
      //   (tsStep1 - tsStep0) / 1000,
      //   tsStep0,
      //   tsStep1,
      //   tsStep2
      // );
      return res;
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

  static async getCommandValue(
    payload: MinskyProcessPayload
  ): Promise<unknown> {
    try {
      return await this.handleMinskyProcess(payload);
    } catch (error) {
      console.log(
        red(
          `🚀 ~ file: restServiceManager.ts ~ line 512 ~ RestServiceManager ~ getCommandValue ~ error: ${error}`
        )
      );
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
        log.error(red(`error: ${error.message}`));
      })
      .on('close', (code) => {
        log.warn(red(`"http-server" child process exited with code ${code}`));
      });
  }
}
