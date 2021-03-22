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
import { join } from 'path';
import { WindowManager } from './windowManager';

const logError = debug('minsky:electron_error');

export class RestServiceManager {
  static minskyProcess: ChildProcess;
  static minskyRESTServicePath: string;

  static handleMinskyProcess(event, payload: MinskyProcessPayload) {
    if (this.minskyProcess && payload.command === 'startMinskyProcess') {
      this.minskyProcess.stdout.emit('close');
      this.minskyProcess = null;

      this.handleMinskyProcessAndRender(payload);
    } else if (
      !this.minskyProcess &&
      payload.command === 'startMinskyProcess'
    ) {
      try {
        this.minskyRESTServicePath = payload.filePath;
        this.minskyProcess = spawn(this.minskyRESTServicePath);
        if (this.minskyProcess) {
          this.minskyProcess.stdout.on('data', (data) => {
            const stdout = data.toString();
            log.info(`stdout: ${stdout}`);

            WindowManager.activeWindows.forEach((aw) => {
              aw.context.webContents.send(
                events.ipc.MINSKY_PROCESS_REPLY,
                `stdout: ${stdout}`
              );
            });

            if (stdout.includes(minskyProcessReplyIndicators.BOOKMARK_LIST)) {
              const _event = null;
              ipcMain.emit(events.ipc.POPULATE_BOOKMARKS, _event, stdout);
            }
          });

          this.minskyProcess.stderr.on('data', (data) => {
            log.info(`stderr: ${data}`);
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
        dialog.showErrorBox('Execution error', 'Could not execute chosen file');
        this.minskyProcess = null;
      }
    } else if (this.minskyProcess) {
      this.executeCommandOnMinskyServer(this.minskyProcess, payload);
    } else {
      logError('Please select the minsky executable first...');
    }
  }

  static handleMinskyProcessAndRender(payload: MinskyProcessPayload) {
    this.handleMinskyProcess(null, payload);
    this.render();
  }

  static render() {
    const renderPayload: MinskyProcessPayload = {
      command: commandsMapping.RENDER_FRAME,
    };

    this.handleMinskyProcess(null, renderPayload);
  }
  private static executeCommandOnMinskyServer(
    minskyProcess: ChildProcess,
    payload: MinskyProcessPayload
  ) {
    let stdinCommand = null;
    switch (payload.command) {
      case commandsMapping.LOAD:
        stdinCommand = `${payload.command} "${payload.filePath}"`;
        ipcMain.emit(events.ipc.ADD_RECENT_FILE, null, payload.filePath);
        break;

      case commandsMapping.RENDER_FRAME:
        stdinCommand = `${payload.command} [${
          WindowManager.activeWindows.get(1).windowId
        }, ${WindowManager.leftOffset}, ${WindowManager.topOffset}]`;
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
      minskyProcess.stdin.write(stdinCommand + newLineCharacter);
    }
  }

  static onGetMinskyCommands(event: Electron.IpcMainEvent) {
    let listOfCommands = [];

    const getMinskyCommandsProcess = spawn(this.minskyRESTServicePath);
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

      const initPayload: MinskyProcessPayload = {
        command: 'startMinskyProcess',
        filePath: _dialog.filePaths[0].toString(),
      };

      this.handleMinskyProcess(null, initPayload);

      const setGroupIconResource = () => {
        const groupIconResourcePayload: MinskyProcessPayload = {
          command: commandsMapping.SET_GROUP_ICON_RESOURCE,
        };

        this.handleMinskyProcess(null, groupIconResourcePayload);
      };

      const setGodleyIconResource = () => {
        const godleyIconPayload: MinskyProcessPayload = {
          command: commandsMapping.SET_GODLEY_ICON_RESOURCE,
        };

        this.handleMinskyProcess(null, godleyIconPayload);
      };

      setGodleyIconResource();
      setGroupIconResource();

      event.returnValue = true;
    } catch (error) {
      logError(error);
      event.returnValue = false;
    }
  }
}
