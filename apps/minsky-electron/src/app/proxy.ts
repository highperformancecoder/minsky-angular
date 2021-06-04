import {
  green,
  MINSKY_HTTP_PROXY_SERVER_PORT,
  MINSKY_HTTP_SERVER_PORT,
} from '@minsky/shared';
import axios from 'axios';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as express from 'express';
const app = express();

const SERVER_URL = `http://localhost:${MINSKY_HTTP_SERVER_PORT}`;

app.use(cors());
app.use(bodyParser.text());

app.get('*', async (req, res) => {
  try {
    const _res = await axios.get(`${SERVER_URL}${req.url}`);

    console.log(
      '🚀 ~ file: proxy.ts ~ line 20 ~ app.get ~ _res.data',
      _res.data
    );
    res.status(200).json(_res.data);
  } catch (error) {
    console.log('🚀 ~ file: proxy.ts ~ line 19 ~ app.all ~ error', error);
    res.status(500).json(error);
  }
});

app.put('*', async (req, res) => {
  try {
    console.log('🚀 ~ file: proxy.ts ~ line 33 ~ app.put ~ req.body', req.body);
    const _res = await axios.put(`${SERVER_URL}${req.url}`, req.body);

    console.log(
      '🚀 ~ file: proxy.ts ~ line 31 ~ app.put ~ _res.data',
      _res.data
    );
    res.status(200).json(_res.data);
  } catch (error) {
    console.log('🚀 ~ file: proxy.ts ~ line 19 ~ app.all ~ error', error);
    res.status(500).json(error);
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
