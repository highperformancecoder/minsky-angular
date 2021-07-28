import {
  green,
  MINSKY_HTTP_PROXY_SERVER_PORT,
  MINSKY_HTTP_SERVER_PORT,
} from '@minsky/shared';
import axios from 'axios';
import cors from 'cors';
import * as express from 'express';
const app = express();

const SERVER_URL = `http://localhost:${MINSKY_HTTP_SERVER_PORT}`;

app.use(cors());
app.use(express.json());

app.get('*', async (req, res) => {
  try {
    const _res = await axios.get(`${SERVER_URL}${req.url}`);

    res.status(200).json(_res.data);
  } catch (error) {
    res.status(500).json(error?.response?.data);
  }
});

app.put('*', async (req, res) => {
  try {
    const _res = await axios.put(`${SERVER_URL}${req.url}`, req.body.arg);
    res.status(200).json(_res.data);
  } catch (error) {
    res.status(500).json(error?.response?.data);
  }
});

export function startProxyServer() {
  app.listen(MINSKY_HTTP_PROXY_SERVER_PORT, () => {
    console.log(
      green(
        `🚀🚀🚀 Proxy server started on port ${MINSKY_HTTP_PROXY_SERVER_PORT}`
      )
    );
  });
}
