import { MINSKY_HTTP_PROXY_SERVER_PORT, red } from '@minsky/shared';
import axios from 'axios';
import * as log from 'electron-log';
export class HttpManager {
  private static URL = `http://localhost:${MINSKY_HTTP_PROXY_SERVER_PORT}`;

  private static async get(command: string) {
    if (!command) {
      throw new Error(`command cannot be blank`);
    }

    return (await axios.get(`${this.URL}${command}`)).data;
  }

  private static async put(command: string, arg: string) {
    if (!command) {
      throw new Error(`command cannot be blank`);
    }

    if (!arg) {
      throw new Error(`arg cannot be blank`);
    }

    return (await axios.put(`${this.URL}${command}`, { arg })).data;
  }

  static async handleMinskyCommand(command: string) {
    try {
      if (!command) {
        throw new Error(`command cannot be blank`);
      }

      const commandMetaData = command.split(' ');

      if (commandMetaData.length >= 2) {
        const [cmd] = commandMetaData;
        const arg = command.substring(command.indexOf(' ') + 1);
        // log.info('🚀🚀🚀 ~ PUT ->', cmd, arg);
        const response = await HttpManager.put(cmd, arg);
        // log.info('PUT:response ->' + JSON.stringify(response));

        return response;
      }

      const [cmd] = commandMetaData;
      // log.info('🚀🚀🚀 ~ GET ->', cmd);
      const response = await HttpManager.get(cmd);
      // log.info('GET:response ->' + JSON.stringify(response));

      return response;
    } catch (error) {
      log.error(red(error));
    }
  }
}
