import axios from 'axios';
import { spawn } from 'child_process';
import { promises } from 'fs';
import * as getPort from 'get-port';
import * as kill from 'kill-port';
import { ChildProcess } from 'node:child_process';
import { promisify } from 'util';
import {
  commandsMapping,
  green,
  MINSKY_SYSTEM_HTTP_SERVER_PATH,
  red,
} from './../../libs/shared/src';

const sleep = promisify(setTimeout);
let minskyHttpServer: ChildProcess = null;
let url = null;
let port = null;

async function initMinskyHttpService() {
  const filePath = MINSKY_SYSTEM_HTTP_SERVER_PATH;

  port = await getPort({ port: [7777, 7778, 7779] });

  url = `http://localhost:${port}`;

  minskyHttpServer = spawn(filePath, [`${port}`]);

  minskyHttpServer.stdout.on('data', (data) => {
    console.info(`http: ${data}`);
  });

  minskyHttpServer.stderr.on('data', (data) => {
    console.error(red(`error: ${data}`));
  });

  minskyHttpServer.on('error', (error) => {
    console.error(red(`error: ${error.message}`));
  });

  minskyHttpServer.on('close', (code) => {
    console.warn(red(`"http-server" child process exited with code ${code}`));
  });

  await sleep(3000);
  return minskyHttpServer;
}

async function checkSignature() {
  if (!minskyHttpServer) {
    minskyHttpServer = await initMinskyHttpService();
  }
  const list = (await axios.get(`${url}${commandsMapping.LIST_V2}`))
    .data as string[];

  const _signature = JSON.parse(
    (await promises.readFile('signature.json')).toString()
  );

  for (const l of list) {
    const signature = (await axios.get(`${url}${`/minsky${l}/@signature`}`))
      .data as Record<string, unknown>;

    if (
      !_signature[l] ||
      JSON.stringify(_signature[l]) !== JSON.stringify(signature)
    ) {
      console.log(
        red(
          `\n 🚀🚀🚀🚀 Signature changed for /minsky${l} ................ 🚀🚀🚀🚀 \n`
        )
      );

      console.log(
        green(`\n    Before: ${JSON.stringify(_signature[l])}     \n`)
      );
      console.log(red(`\n    After: ${JSON.stringify(signature)}    \n`));
      return;
    }
  }

  console.log(
    green('\n 🚀🚀🚀🚀 No Change In Signature................ 🚀🚀🚀🚀 \n')
  );
}

(async () => {
  await checkSignature().catch(console.error);
  await kill(port, 'tcp').catch(console.error);
  minskyHttpServer.kill('SIGINT');
  process.exit(1);
})();
