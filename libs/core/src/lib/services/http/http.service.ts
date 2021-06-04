import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MINSKY_HTTP_PROXY_SERVER_PORT } from '@minsky/shared';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}
  private URL = `http://localhost:${MINSKY_HTTP_PROXY_SERVER_PORT}`;

  private get(command: string) {
    if (!command) {
      throw new Error(`command cannot be blank`);
    }

    return this.http.get<any>(`${this.URL}${command}`);
  }

  private put(command: string, arg: string) {
    if (!command) {
      throw new Error(`command cannot be blank`);
    }

    if (!arg) {
      throw new Error(`arg cannot be blank`);
    }

    return this.http.put<any>(`${this.URL}${command}`, arg);
  }

  handleMinskyCommand(command: string) {
    if (!command) {
      throw new Error(`command cannot be blank`);
    }

    const commandMetaData = command.split(' ');

    if (commandMetaData.length === 2) {
      const [cmd, arg] = commandMetaData;

      console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ PUT ->', cmd, arg);

      return this.put(cmd, arg);
    }

    const [cmd] = commandMetaData;

    console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ GET ->', cmd);

    return this.get(cmd);
  }
}
