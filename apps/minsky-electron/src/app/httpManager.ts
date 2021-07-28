import {
  MINSKY_HTTP_PROXY_SERVER_PORT,
  MINSKY_HTTP_SERVER_PORT,
  red,
} from '@minsky/shared';
import axios from 'axios';
import * as log from 'electron-log';

const USE_PROXY = true;

export class HttpManager {
  private static URL = `http://localhost:${
    USE_PROXY ? MINSKY_HTTP_PROXY_SERVER_PORT : MINSKY_HTTP_SERVER_PORT
  }`;

  private static async get(command: string): Promise<unknown> {
    if (!command) {
      throw new Error(`command cannot be blank`);
    }
    return (await axios.get(`${this.URL}${command}`)).data;
  }

  private static async put(command: string, arg: string): Promise<unknown> {
    if (!command) {
      throw new Error(`command cannot be blank`);
    }
    if (!arg) {
      throw new Error(`arg cannot be blank`);
    }
    const bodyArg = USE_PROXY ? { arg } : arg;
    const result = await axios.put(`${this.URL}${command}`, bodyArg);
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
      log.info('GET:response ->' + JSON.stringify(response));
      return response;
    } catch (error) {
      log.error(red(`Command failed: ${command}`));
      log.error(red(error?.response?.data));
    }
  }
}
