import * as getPort from 'get-port';
export class PortsManager {
  static MINSKY_HTTP_SERVER_PORT: number;

  static MINSKY_HTTP_PROXY_SERVER_PORT: number;

  static async generateHttpServerPort() {
    if (this.MINSKY_HTTP_SERVER_PORT) {
      return this.MINSKY_HTTP_SERVER_PORT;
    }

    // Will use 4444 if available, otherwise fall back to a random port
    this.MINSKY_HTTP_SERVER_PORT = await getPort({ port: 4444 });

    return this.MINSKY_HTTP_SERVER_PORT;
  }

  static async generateHttpProxyServerPort() {
    if (this.MINSKY_HTTP_PROXY_SERVER_PORT) {
      return this.MINSKY_HTTP_PROXY_SERVER_PORT;
    }

    // Will use 5555 if available, otherwise fall back to a random port
    this.MINSKY_HTTP_PROXY_SERVER_PORT = await getPort({ port: 5555 });

    return this.MINSKY_HTTP_PROXY_SERVER_PORT;
  }
}
