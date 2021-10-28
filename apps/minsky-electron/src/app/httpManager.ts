import { red } from '@minsky/shared';
import axios from 'axios';
import * as log from 'electron-log';
import { PortsManager } from './portsManager';

const USE_PROXY = true;

export class HttpManager {
  private static async getURL(): Promise<string> {
    return `http://localhost:${
      USE_PROXY
        ? PortsManager.MINSKY_HTTP_PROXY_SERVER_PORT ||
          (await PortsManager.generateHttpServerPort())
        : PortsManager.MINSKY_HTTP_SERVER_PORT ||
          (await PortsManager.generateHttpProxyServerPort())
    }`;
  }

  private static async get(command: string): Promise<unknown> {
    if (!command) {
      throw new Error(`command cannot be blank`);
    }
    return (await axios.get(`${await this.getURL()}${command}`)).data;
  }

  private static async put(command: string, arg: string): Promise<unknown> {
    if (!command) {
      throw new Error(`command cannot be blank`);
    }
    if (!arg) {
      throw new Error(`arg cannot be blank`);
    }
    const bodyArg = USE_PROXY ? { arg } : arg;
    const result = await axios.put(`${await this.getURL()}${command}`, bodyArg);
    if (result) {
      return result.data;
    }
    return null;
  }

  static async handleMinskyCommand(command: string): Promise<unknown> {
    // TODO:: Check if interface can be made faster by avoiding string operations

    try {
      if (!command) {
        throw new Error(`command cannot be blank`);
      }

      const commandMetaData = command.split(' ');

      if (commandMetaData.length >= 2) {
        const [cmd] = commandMetaData;
        const arg = command.substring(command.indexOf(' ') + 1);
        // CAVEAT: logging before invoking command seems to cause performance issues
        log.info('PUT ->', cmd, arg);
        const response = await HttpManager.put(cmd, arg);
        log.info('PUT:response ->' + JSON.stringify(response));
        return response;
      }
      const [cmd] = commandMetaData;
      // CAVEAT: logging before invoking command seems to cause performance issues
      log.info('GET ->', cmd);
      const response = await HttpManager.get(cmd);
      log.info('GET:response ->' + response );//JSON.stringify(response));
      return response;
    } catch (error) {
      log.error(red(`Command failed: ${command}`));
      log.error(red(error?.response?.data));
    }
  }
}
