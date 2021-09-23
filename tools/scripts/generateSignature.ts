import axios from 'axios';
import { spawn } from 'child_process';
import { promises } from 'fs';
import * as getPort from 'get-port';
import { promisify } from 'util';
import {
  commandsMapping,
  green,
  MINSKY_SYSTEM_HTTP_SERVER_PATH,
  red,
} from './../../libs/shared/src';

let minskyHttpServer = null;
let url = null;

const sleep = promisify(setTimeout);
async function initMinskyHttpService() {
  const filePath = MINSKY_SYSTEM_HTTP_SERVER_PATH;

  const port = await getPort({ port: [7777, 7778, 9999] });

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

async function generateSignature() {
  if (!minskyHttpServer) {
    minskyHttpServer = await initMinskyHttpService();
  }

  const listSignatures = {};

  const list = (await axios.get(`${url}${commandsMapping.LIST_V2}`))
    .data as string[];

  for (const l of list) {
    const signature = (await axios.get(`${url}${`/minsky${l}/@signature`}`))
      .data as Record<string, unknown>;

    listSignatures[l] = signature;
  }

  await promises.writeFile(
    'signature.json',
    JSON.stringify(listSignatures, null, 4)
  );

  console.log(
    green('\n 🚀🚀🚀🚀 New Signature File Generated............... 🚀🚀🚀🚀 \n')
  );
}

(async () => {
  await generateSignature().catch(console.error);
  process.exit();
})();
