import {
  commandsMapping,
  events,
  green,
  MainRenderingTabs,
  MinskyProcessPayload,
  MINSKY_SYSTEM_HTTP_SERVER_PATH,
  normalizeFilePathForPlatform,
  red,
  USE_FRONTEND_DRIVEN_RENDERING,
  USE_MINSKY_SYSTEM_BINARY,
} from '@minsky/shared';
import { ChildProcess, spawn } from 'child_process';
import { dialog, ipcMain } from 'electron';
import * as log from 'electron-log';
// import { HttpManager } from './httpManager';
import { join } from 'path';
import { PortsManager } from './portsManager';
import { RecordingManager } from './recordingManager';
import { StoreManager } from './storeManager';
import { Utility } from './utility';
import { WindowManager } from './windowManager';
const JSON5 = require('json5');

log.info('resources path=' + process.resourcesPath);
const addonDir = Utility.isPackaged()
  ? '../../node-addons'
  : '../../../node-addons';

// eslint-disable-next-line @typescript-eslint/no-var-requires
let restService = null;
try {
  restService = require('bindings')(join(addonDir, 'minskyRESTService.node'));
} catch (error) {
  log.error(error);
}

log.info(restService.call('/minsky/minskyVersion', ''));

console.log(JSON.parse('1E1024'));

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

// TODO refactor to use command and arguments separately
function callRESTApi(command: string) {
  const {
    leftOffset,
    canvasWidth,
    canvasHeight,
    electronTopOffset,
  } = WindowManager;

  console.log(
    'In callRESTApi::',
    'left offset = ',
    leftOffset,
    '| CDims =',
    canvasWidth,
    canvasHeight,
    '| ETO=',
    electronTopOffset
  );
  if (!command) {
    log.error('callRESTApi called without any command');
    return {};
  }
  const commandMetaData = command.split(' ');
  const [cmd] = commandMetaData;
  let arg = '';
  if (commandMetaData.length >= 2) {
    arg = command.substring(command.indexOf(' ') + 1);
  }
  try {
    log.info('calling: ' + cmd + ': ' + arg);
    const response = restService.call(cmd, arg);
    log.info('response: ' + response);
    return JSON5.parse(response);
  } catch (error) {
    dialog.showErrorBox(
      'Something went wrong while calling the Minsky Backend',
      error?.response?.data
    );
    // TODO - properly alert the user of the error message
    log.error('Exception caught: ' + error?.response?.data);
    return {};
    //alert(error?.response?.data);
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

  private static currentTab: MainRenderingTabs = MainRenderingTabs.canvas;

  public static async setCurrentTab(tab: MainRenderingTabs) {
    if (tab !== this.currentTab) {
      this.currentTab = tab;
      this.render = true;
      this.lastMouseMovePayload = null;
      this.lastModelMoveToPayload = null;
      this.lastZoomPayload = null;
      this.handleMinskyProcess({
        command: commandsMapping.RENDER_FRAME_SUBCOMMAND,
      });
    }
  }

  public static async reInvokeRenderFrame() {
    await this.handleMinskyProcess({
      command: commandsMapping.RENDER_FRAME_SUBCOMMAND,
    });
  }

  private static async processCommandsInQueueNew(): Promise<unknown> {
    // Should be on a separate thread......? Janak
    const shouldProcessQueue = this.isQueueEnabled
      ? !this.runningCommand && this.payloadDataQueue.length > 0
      : this.payloadDataQueue.length > 0;

    if (shouldProcessQueue) {
      const nextItem = this.payloadDataQueue.shift();

      if (nextItem.payload.command === commandsMapping.MOUSEMOVE_SUBCOMMAND) {
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

  public static async onQuit() {
    console.log('Please complete onQuit Actions!');
    //TODO:
    // 1. Flush commands queue
    // 2. Kill  Minsky process (wait for it to be killed)
  }

  private static async resumeQueueProcessing(): Promise<unknown> {
    this.runningCommand = false;
    return await this.processCommandsInQueueNew();
  }

  public static async handleMinskyProcess(
    payload: MinskyProcessPayload
  ): Promise<unknown> {
    //    const isStartProcessCommand =
    //      payload.command === commandsMapping.START_MINSKY_PROCESS;
    //
    //    if (isStartProcessCommand) {
    //      await this.startHttpServer(payload);
    //      return;
    //    }
    //
    //    if (!this.minskyHttpServer) {
    //      console.error('Minsky HTTP server is not running yet.');
    //      return;
    //    }

    const wasQueueEmpty = this.payloadDataQueue.length === 0;

    const shouldProcessQueue = this.isQueueEnabled
      ? !this.runningCommand && wasQueueEmpty
      : true;

    let queueItem: QueueItem = { payload, promise: new Deferred() };

    // TODO:: Take into account Tab when merging commands
    if (payload.command === commandsMapping.MOUSEMOVE_SUBCOMMAND) {
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

      case commandsMapping.MOUSEMOVE_SUBCOMMAND:
        stdinCommand = `${this.currentTab}/${payload.command} [${payload.mouseX}, ${payload.mouseY}]`;
        break;

      case commandsMapping.MOVE_TO:
        stdinCommand = `${payload.command} [${payload.mouseX}, ${payload.mouseY}]`;
        break;

      case commandsMapping.MOUSEDOWN_SUBCOMMAND:
        // eslint-disable-next-line no-case-declarations
        const actualMouseDownCmd =
          this.currentTab === MainRenderingTabs.canvas
            ? payload.command
            : commandsMapping.MOUSEDOWN_FOR_OTHER_TABS;

        stdinCommand = `${this.currentTab}/${actualMouseDownCmd} [${payload.mouseX}, ${payload.mouseY}]`;
        break;

      case commandsMapping.MOUSEUP_SUBCOMMAND:
        stdinCommand = `${this.currentTab}/${payload.command} [${payload.mouseX}, ${payload.mouseY}]`;
        break;

      case commandsMapping.ZOOM_IN:
        stdinCommand = `${payload.command} [${payload.args.x}, ${payload.args.y}, ${payload.args.zoomFactor}]`;
        break;

      case commandsMapping.SET_GODLEY_ICON_RESOURCE:
        // eslint-disable-next-line no-case-declarations
        const godleyIconFilePath = normalizeFilePathForPlatform(
          Utility.isDevelopmentMode()
            ? `${join(__dirname, 'assets/godley.svg')}`
            : `${join(process.resourcesPath, 'assets/godley.svg')}`
        );
        stdinCommand = `${payload.command} "${godleyIconFilePath}"`;

        break;

      case commandsMapping.SET_GROUP_ICON_RESOURCE:
        // eslint-disable-next-line no-case-declarations
        const groupIconFilePath = normalizeFilePathForPlatform(
          Utility.isDevelopmentMode()
            ? `${join(__dirname, 'assets/group.svg')}`
            : `${join(process.resourcesPath, 'assets/group.svg')}"`
        );

        stdinCommand = `${payload.command} "${groupIconFilePath}"`;
        break;

      case commandsMapping.REQUEST_REDRAW_SUBCOMMAND:
        stdinCommand = this.getRequestRedrawCommand();
        break;

      default:
        stdinCommand = payload.command;
        break;
    }
    if (stdinCommand) {
      if (RecordingManager.isRecording) {
        RecordingManager.record(stdinCommand);
      }

      if (payload.command === commandsMapping.RENDER_FRAME_SUBCOMMAND) {
        // Render called explicitly
        this.render = false;
        await callRESTApi(this.getRenderCommand());
        return await callRESTApi(this.getRequestRedrawCommand());
        //          await HttpManager.handleMinskyCommand(this.getRenderCommand());
        //        return await HttpManager.handleMinskyCommand(
        //          this.getRequestRedrawCommand()
        //        );
        // TODO:: Check which of the above command's response we should return
      }

      const res = callRESTApi(stdinCommand); //await HttpManager.handleMinskyCommand(stdinCommand);
      const { render = true } = payload;

      if ((USE_FRONTEND_DRIVEN_RENDERING && render) || this.render) {
        const renderCommand = this.getRenderCommand();

        if (renderCommand) {
          //          await HttpManager.handleMinskyCommand(renderCommand);
          //          await HttpManager.handleMinskyCommand(this.getRequestRedrawCommand());
          await callRESTApi(this.getRenderCommand());
          await callRESTApi(this.getRequestRedrawCommand());
          this.render = false;
        }
      }
      return res;
    }
    log.error('Command was null or undefined');
  }

  private static getRequestRedrawCommand(tab?: MainRenderingTabs) {
    if (!tab) {
      tab = this.currentTab;
    }
    return `${tab}/${commandsMapping.REQUEST_REDRAW_SUBCOMMAND}`;
  }

  private static getRenderCommand(tab?: MainRenderingTabs) {
    const {
      leftOffset,
      canvasWidth,
      canvasHeight,
      activeWindows,
      electronTopOffset,
    } = WindowManager;

    if (!tab) {
      tab = this.currentTab;
    }

    log.info('canvasHeight=', canvasHeight, ' canvasWidth=', canvasWidth);

    if (!canvasHeight || !canvasWidth) {
      return null;
    }

    const mainWindowId = activeWindows.get(1).systemWindowId;
    const renderCommand = `${tab}/${commandsMapping.RENDER_FRAME_SUBCOMMAND} [${mainWindowId},${leftOffset},${electronTopOffset},${canvasWidth},${canvasHeight}]`;

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
      const filePath = normalizeFilePathForPlatform(_dialog.filePaths[0]);
      this.startMinskyService(filePath, true);
    } catch (error) {
      console.error(error);
    }
  }

  static async startHttpServer(payload: MinskyProcessPayload) {
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

      this.minskyHttpServer = spawn(filePath, [
        `${
          PortsManager.MINSKY_HTTP_SERVER_PORT ||
          (await PortsManager.generateHttpServerPort())
        }`,
      ]);

      console.log(
        green(
          `🚀🚀🚀 HTTP server "${filePath}" started on port ${PortsManager.MINSKY_HTTP_SERVER_PORT}`
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
