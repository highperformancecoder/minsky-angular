import { green } from '@minsky/shared';
import axios from 'axios';
import cors from 'cors';
import * as express from 'express';
import { PortsManager } from './portsManager';
const app = express();

async function getServerURL() {
  return `http://localhost:${
    PortsManager.MINSKY_HTTP_SERVER_PORT ||
    (await PortsManager.generateHttpServerPort())
  }`;
}

async function getProxyServerPort() {
  return (
    PortsManager.MINSKY_HTTP_PROXY_SERVER_PORT ||
    (await PortsManager.generateHttpProxyServerPort())
  );
}

app.use(cors());
app.use(express.json());

app.get('*', async (req, res) => {
  try {
    const _res = await axios.get(`${await getServerURL()}${req.url}`);

    res.status(200).json(_res.data);
  } catch (error) {
    res.status(500).json(error?.response?.data);
  }
});

app.put('*', async (req, res) => {
  try {
    const _res = await axios.put(
      `${await getServerURL()}${req.url}`,
      req.body.arg
    );
    res.status(200).json(_res.data);
  } catch (error) {
    res.status(500).json(error?.response?.data);
  }
});

export async function startProxyServer() {
  app.listen(await getProxyServerPort(), async () => {
    console.log(
      green(`🚀🚀🚀 Proxy server started on port ${await getProxyServerPort()}`)
    );
  });
}
