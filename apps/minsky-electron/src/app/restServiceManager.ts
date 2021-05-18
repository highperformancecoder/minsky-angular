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
import { join } from 'path';
import { StoreManager } from './storeManager';
import { WindowManager } from './windowManager';
const logError = debug('minsky:electron_error');

export class RestServiceManager {
  static minskyProcess: ChildProcess;
  static currentMinskyModelFilePath: string;
  static isFirstStart = true;
  private static isRecording = false;
  private static recordingWriteStream: WriteStream;
  private static recordingReadStream: ReadStream;
  private static recordingFilePath: string;
  private static JSONStreamWriter;
  static isCanvasEdited = false;

  private static lastMouseMovePayload: MinskyProcessPayload = null;
  private static lastModelMoveToPayload: MinskyProcessPayload = null;
  private static payloadDataQueue: Array<MinskyProcessPayload> = [];
  private static runningCommand = false;


  private static processCommandsInQueueNew() {
    // Should be on a separate thread......? Janak
    if (!this.runningCommand && (this.payloadDataQueue.length > 0)) {
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
    const wasQueueEmpty = (this.payloadDataQueue.length === 0);
    const isStartProcessCommand = (payload.command === commandsMapping.START_MINSKY_PROCESS);
    if(isStartProcessCommand) {
      this.startMinskyProcess(payload);
      return;
    } else {
      if(!this.minskyProcess) {
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
      StoreManager.store.set('minskyRESTServicePath', filePath);

      this.minskyProcess = spawn(filePath);
      if (this.minskyProcess) {
        this.minskyProcess.stdout.once('data', () => {
          // Earlier we were pausing queue here
        });

        this.minskyProcess.stdout.on('data', (data) => {
          const stdout = data.toString().trim();
          log.info(`stdout: ${stdout}`);

          WindowManager.activeWindows.forEach((aw) => {
            aw.context.webContents.send(
              events.ipc.MINSKY_PROCESS_REPLY,
              `stdout: ${stdout}`
            );
          });


          if (stdout.includes('=>') || stdout === "{}") {
            //this.queue.start();
          }

          if (stdout.includes('renderFrame=>')) {
            this.runningCommand = false;
            this.processCommandsInQueueNew();
          }

          RestServiceManager.handleStdout(stdout);
        });

        this.minskyProcess.stderr.on('data', (data) => {
          log.info(`stderr: ${data}`);
          this.processCommandsInQueueNew();
          WindowManager.activeWindows.forEach((aw) => {
            aw.context.webContents.send(
              events.ipc.MINSKY_PROCESS_REPLY,
              `stderr: ${data}`
            );
          });
        });

        this.minskyProcess.on('error', (error) => {
          log.info(`error: ${error.message}`);
          WindowManager.activeWindows.forEach((aw) => {
            aw.context.webContents.send(
              events.ipc.MINSKY_PROCESS_REPLY,
              `error: ${error.message}`
            );
          });
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
        this.runningCommand = false;
        this.processCommandsInQueueNew();
      }
    } catch {
      dialog.showErrorBox(
        'Execution error',
        'Could not execute chosen file'
      );
      this.minskyProcess = null;
    }
  }


  private static handleMinskyPayload(payload: MinskyProcessPayload) {
    if (this.minskyProcess) {
      switch (payload.command) {
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
      logError('Please select the minsky executable first...');
    }
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

      case commandsMapping.MOVE_TO:
        stdinCommand = `${payload.command} [${payload.mouseX}, ${payload.mouseY}]`;
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

      minskyProcess.stdin.write(miscCommand);
      minskyProcess.stdin.write(renderCommand);
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
