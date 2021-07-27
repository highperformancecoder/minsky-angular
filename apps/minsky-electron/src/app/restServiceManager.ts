import {
  commandsMapping,
  events,
  green,
  MinskyProcessPayload,
  MINSKY_HTTP_SERVER_PORT,
  MINSKY_SYSTEM_HTTP_SERVER_PATH,
  red,
  USE_MINSKY_SYSTEM_BINARY,
  USE_FRONTEND_DRIVEN_RENDERING
} from '@minsky/shared';
import { ChildProcess, spawn } from 'child_process';
import { dialog, ipcMain } from 'electron';
import * as log from 'electron-log';
import { join } from 'path';
import { HttpManager } from './httpManager';
import { RecordingManager } from './recordingManager';
import { StoreManager } from './storeManager';
import { Utility } from './utility';
import { WindowManager } from './windowManager';

interface QueueItem {
  promise: Deferred;
  payload: MinskyProcessPayload;
}

class Deferred {
  public promise;
  public reject;
  public resolve;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

export class RestServiceManager {
  static minskyHttpServer: ChildProcess;
  static currentMinskyModelFilePath: string;

  private static lastMouseMovePayload: MinskyProcessPayload = null;
  private static lastModelMoveToPayload: MinskyProcessPayload = null;
  private static payloadDataQueue: Array<QueueItem> = [];
  private static runningCommand = false;
  private static isQueueEnabled = true;
  private static render = true;
  private static lastZoomPayload: MinskyProcessPayload = null;
  static availableOperationsMappings: Record<string, string[]> = {};

  private static async processCommandsInQueueNew(): Promise<unknown> {
    // Should be on a separate thread......? Janak
    const shouldProcessQueue = this.isQueueEnabled
      ? !this.runningCommand && this.payloadDataQueue.length > 0
      : this.payloadDataQueue.length > 0;

    if (shouldProcessQueue) {
      const nextItem = this.payloadDataQueue.shift();

      if (nextItem.payload.command === commandsMapping.mousemove) {
        this.lastMouseMovePayload = null;
      } else if (nextItem.payload.command === commandsMapping.MOVE_TO) {
        this.lastModelMoveToPayload = null;
      } else if (nextItem.payload.command === commandsMapping.ZOOM_IN) {
        this.lastZoomPayload = null;
      }
      this.runningCommand = true;
      const res = await this.handleMinskyPayload(nextItem.payload);
      nextItem.promise.resolve(res);
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
    const isStartProcessCommand =
      payload.command === commandsMapping.START_MINSKY_PROCESS;

    if (isStartProcessCommand) {
      this.startHttpServer(payload);
      return;
    }

    if (!this.minskyHttpServer) {
      console.error('Minsky HTTP server is not running yet.');
      return;
    }

    const wasQueueEmpty = this.payloadDataQueue.length === 0;

    const shouldProcessQueue = this.isQueueEnabled
      ? !this.runningCommand && wasQueueEmpty
      : true;

    let queueItem: QueueItem = { payload, promise: new Deferred() };

    if (payload.command === commandsMapping.mousemove) {
      if (this.lastMouseMovePayload !== null) {
        // console.log("Merging mouse move commands");
        this.lastMouseMovePayload.mouseX = payload.mouseX;
        this.lastMouseMovePayload.mouseY = payload.mouseY;
        queueItem = null;
      } else {
        this.lastMouseMovePayload = payload;
        this.payloadDataQueue.push(queueItem);
      }
      this.lastModelMoveToPayload = null;
      this.lastZoomPayload = null;
    } else if (payload.command === commandsMapping.MOVE_TO) {
      if (this.lastModelMoveToPayload !== null) {
        this.lastModelMoveToPayload.mouseX = payload.mouseX;
        this.lastModelMoveToPayload.mouseY = payload.mouseY;
        queueItem = null;
      } else {
        this.lastModelMoveToPayload = payload;
        this.payloadDataQueue.push(queueItem);
      }
      this.lastMouseMovePayload = null;
      this.lastZoomPayload = null;
    } else if (payload.command === commandsMapping.ZOOM_IN) {
      if (this.lastZoomPayload !== null) {
        this.lastZoomPayload.args.x = payload.args.x;
        this.lastZoomPayload.args.y = payload.args.y;
        (this.lastZoomPayload.args.zoomFactor as number) *= payload.args
          .zoomFactor as number;
        queueItem = null;
      } else {
        this.lastZoomPayload = payload;
        this.payloadDataQueue.push(queueItem);
      }
      this.lastMouseMovePayload = null;
      this.lastModelMoveToPayload = null;
    } else {
      this.lastMouseMovePayload = null;
      this.lastModelMoveToPayload = null;
      this.lastZoomPayload = null;

      if (queueItem) {
        this.payloadDataQueue.push(queueItem);
      }
    }
    if (shouldProcessQueue) {
      // Control will come here when a new command comes after the whole queue was processed
      await this.processCommandsInQueueNew();
    }

    if (queueItem) {
      return queueItem.promise.promise;
    }
    return null;
  }

  private static async handleMinskyPayload(
    payload: MinskyProcessPayload
  ): Promise<unknown> {
    let res = null;

    switch (payload.command) {
      case commandsMapping.RECORD:
        await RecordingManager.handleRecord();
        break;

      case commandsMapping.RECORDING_REPLAY:
        await RecordingManager.handleRecordingReplay();
        break;

      case commandsMapping.AVAILABLE_OPERATIONS_MAPPING:
        res = this.availableOperationsMappings;
        break;

      default:
        res = await this.executeCommandOnMinskyServer(payload);
        break;
    }
    await this.resumeQueueProcessing();

    return res;
  }

  private static async executeCommandOnMinskyServer(
    payload: MinskyProcessPayload
  ): Promise<unknown> {
    let stdinCommand = null;
    switch (payload.command) {
      case commandsMapping.LOAD:
        stdinCommand = `${payload.command} "${payload.filePath}"`;
        this.render = true;
        break;

      case commandsMapping.SAVE:
        stdinCommand = `${payload.command} "${payload.filePath}"`;

        this.currentMinskyModelFilePath = payload.filePath;

        ipcMain.emit(events.ADD_RECENT_FILE, null, payload.filePath);
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

      case commandsMapping.ZOOM_IN:
        stdinCommand = `${payload.command} [${payload.args.x}, ${payload.args.y}, ${payload.args.zoomFactor}]`;
        break;

      case commandsMapping.SET_GODLEY_ICON_RESOURCE:
        stdinCommand = Utility.isDevelopmentMode()
          ? `${payload.command} "${join(__dirname, 'assets/godley.svg')}"`
          : `${payload.command} "${join(
            process.resourcesPath,
            'assets/godley.svg'
          )}"`;

        break;

      case commandsMapping.SET_GROUP_ICON_RESOURCE:
        stdinCommand = Utility.isDevelopmentMode()
          ? `${payload.command} "${join(__dirname, 'assets/group.svg')}"`
          : `${payload.command} "${join(
            process.resourcesPath,
            'assets/group.svg'
          )}"`;
        break;

      case commandsMapping.REDRAW:
        stdinCommand = this.getRenderCommand();
        break;

      default:
        stdinCommand = payload.command;
        break;
    }
    if (stdinCommand) {
      const miscCommand = stdinCommand;
      const renderCommand = this.getRenderCommand();

      if (RecordingManager.isRecording) {
        RecordingManager.record(stdinCommand);
      }

      const res = await HttpManager.handleMinskyCommand(miscCommand);
      const { render = true } = payload;
      if ((USE_FRONTEND_DRIVEN_RENDERING && render) || (
        this.render &&
        WindowManager.canvasHeight &&
        WindowManager.canvasWidth
      )) {
        this.render = false;
        await HttpManager.handleMinskyCommand(renderCommand);
      }

      return res;
    }
    console.error('Command was null or undefined');
  }


  public static getRenderCommandForPopupWindows(uid : number) {
    const systemWindowId = WindowManager.getSystemWindowIdFromUid(uid);
    if(systemWindowId) {
      // TODO:: Get the proper offsets
      return `${commandsMapping.GET_NAMED_ITEM}/${uid}/second/renderFrame [ ${systemWindowId}, 0, 0, 100, 100 ]`
    }
    return null;
  }


  private static getRenderCommand() {
    const {
      leftOffset,
      canvasWidth,
      canvasHeight,
      activeWindows,
      electronTopOffset,
    } = WindowManager;

    const mainWindowId = activeWindows.get(1).systemWindowId;

    const renderCommand = `${commandsMapping.RENDER_FRAME} [${mainWindowId},${leftOffset},${electronTopOffset},${canvasWidth},${canvasHeight}]`;

    return renderCommand;
  }

  static async startMinskyService(
    filePath: string = null,
    showServiceStartedDialog = false
  ) {
    if (USE_MINSKY_SYSTEM_BINARY) {
      filePath = MINSKY_SYSTEM_HTTP_SERVER_PATH;
    } else {
      filePath = filePath || StoreManager.store.get('minskyHttpServerPath');
    }

    if (!filePath) {
      return;
    }

    const initPayload: MinskyProcessPayload = {
      command: commandsMapping.START_MINSKY_PROCESS,
      filePath,
      showServiceStartedDialog,
      render: false,
    };

    await this.handleMinskyProcess(initPayload);

    const setGroupIconResource = async () => {
      const groupIconResourcePayload: MinskyProcessPayload = {
        command: commandsMapping.SET_GROUP_ICON_RESOURCE,
        render: false,
      };

      await this.handleMinskyProcess(groupIconResourcePayload);
    };

    const setGodleyIconResource = async () => {
      const godleyIconPayload: MinskyProcessPayload = {
        command: commandsMapping.SET_GODLEY_ICON_RESOURCE,
        render: false,
      };

      await this.handleMinskyProcess(godleyIconPayload);
    };

    setTimeout(async () => {
      await setGodleyIconResource();
      await setGroupIconResource();
    }, 100);
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

      this.startMinskyService(_dialog.filePaths[0], true);
    } catch (error) {
      console.error(error);
    }
  }

  static startHttpServer(payload: MinskyProcessPayload) {
    if (this.minskyHttpServer) {
      this.minskyHttpServer.stdout.emit('close');
      this.minskyHttpServer.kill();
      this.minskyHttpServer = null;
      this.payloadDataQueue = [];
      this.lastMouseMovePayload = null;
      this.lastModelMoveToPayload = null;
    }
    try {
      let { filePath } = payload;
      const { showServiceStartedDialog = true } = payload;

      if (USE_MINSKY_SYSTEM_BINARY) {
        filePath = MINSKY_SYSTEM_HTTP_SERVER_PATH;
      } else {
        filePath = filePath || StoreManager.store.get('minskyHttpServerPath');
      }

      if (!filePath) {
        return;
      }

      if (!USE_MINSKY_SYSTEM_BINARY) {
        StoreManager.store.set('minskyHttpServerPath', filePath);
      }

      this.minskyHttpServer = spawn(filePath, [`${MINSKY_HTTP_SERVER_PORT}`]);

      console.log(
        green(
          `🚀🚀🚀 HTTP server "${filePath}" started on port ${MINSKY_HTTP_SERVER_PORT}`
        )
      );

      if (this.minskyHttpServer) {
        this.minskyHttpServer.stdout.on('data', (data) => {
          log.info(`http: ${data}`);
        });

        this.minskyHttpServer.stderr.on('data', (data) => {
          log.error(red(`error: ${data}`));
        });

        this.minskyHttpServer.on('error', (error) => {
          log.error(red(`error: ${error.message}`));
        });

        this.minskyHttpServer.on('close', (code) => {
          log.warn(red(`"http-server" child process exited with code ${code}`));
        });

        if (!showServiceStartedDialog) {
          return;
        }
        dialog.showMessageBoxSync({
          type: 'info',
          title: 'Minsky HTTP Service Started',
          message: 'You can now choose model files to be loaded',
        });
      }
    } catch (error) {
      console.error(error);
      dialog.showErrorBox('Execution error', 'Could not start the HTTP Server');
      this.minskyHttpServer = null;
    }
  }
}
