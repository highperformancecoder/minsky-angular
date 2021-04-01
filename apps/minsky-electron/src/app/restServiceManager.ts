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
import {
  createReadStream,
  createWriteStream,
  readFileSync,
  ReadStream,
  WriteStream,
} from 'fs';
import { default as PQueue } from 'p-queue';
import { join } from 'path';
import { StoreManager } from './storeManager';
import { WindowManager } from './windowManager';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const JSONStream = require('JSONStream');

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
  static handleMinskyProcess(payload: MinskyProcessPayload) {
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
          RestServiceManager.handleRecord();

          break;

        case commandsMapping.RECORDING_REPLAY:
          RestServiceManager.handleRecordingReplay();
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

          StoreManager.store.set('minskyRESTServicePath', payload.filePath);

          this.minskyProcess = spawn(payload.filePath);
          if (this.minskyProcess) {
            this.minskyProcess.stdout.once('data', () => {
              this.queue.on('next', () => {
                this.queue.pause();
              });
            });

            this.minskyProcess.stdout.on('data', (data) => {
              const stdout = data.toString();
              log.info(`stdout: ${stdout}`);

              WindowManager.activeWindows.forEach((aw) => {
                aw.context.webContents.send(
                  events.ipc.MINSKY_PROCESS_REPLY,
                  `stdout: ${stdout}`
                );
              });

              if (stdout.includes('=>')) {
                this.queue.start();
              }

              if (stdout.includes(minskyProcessReplyIndicators.BOOKMARK_LIST)) {
                const _event = null;
                ipcMain.emit(events.ipc.POPULATE_BOOKMARKS, _event, stdout);
              }
            });

            this.minskyProcess.stderr.on('data', (data) => {
              log.info(`stderr: ${data}`);
              this.queue.start();

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

  private static handleRecordingReplay() {
    /*
      save existing model? yes ? no ?
      replay recording in a new canvas
    */

    this.stopRecording();

    (async () => {
      // const saveDialog = await dialog.showSaveDialog({});
      // RestServiceManager.handleMinskyProcess({
      //   command: `${commandsMapping.SAVE} "${saveDialog.filePath}"`,
      // });
      // TODO: handle save dialog and cancel

      RestServiceManager.handleMinskyProcess({
        command: commandsMapping.START_MINSKY_PROCESS,
        filePath: StoreManager.store.get('minskyRESTServicePath'),
      });

      const replayRecordingDialog = await dialog.showOpenDialog({
        filters: [
          { extensions: ['json'], name: 'JSON' },
          { extensions: ['*'], name: 'All Files' },
        ],
      });

      this.recordingReadStream = createReadStream(
        replayRecordingDialog.filePaths[0]
      );
      const replayFile = readFileSync(replayRecordingDialog.filePaths[0], {
        encoding: 'utf8',
        flag: 'r',
      });

      JSON.parse(replayFile).forEach((line) => {
        RestServiceManager.executeCommandOnMinskyServer(this.minskyProcess, {
          command: line.command,
        });
      });

      this.recordingReadStream.close();
      this.recordingReadStream = null;
    })();
  }

  private static record(command: string) {
    const payload = { command: command, executedAt: Date.now() };

    if (!this.recordingWriteStream) {
      this.recordingWriteStream = createWriteStream(this.recordingFilePath);
      this.JSONStreamWriter = JSONStream.stringify();
      this.JSONStreamWriter.pipe(this.recordingWriteStream);
    }

    if (
      !command.includes(
        // 'mouseMove' ||
        'getItemAt' ||
          'getItemAtFocus' ||
          'getWireAt' ||
          commandsMapping.START_MINSKY_PROCESS ||
          commandsMapping.RECORD ||
          commandsMapping.RECORDING_REPLAY
      )
    )
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

  static onGetMinskyCommands(event: Electron.IpcMainEvent) {
    let listOfCommands = [];

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

      RestServiceManager.startMinskyService(_dialog.filePaths[0]);

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
