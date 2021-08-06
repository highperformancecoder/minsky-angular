import {
  commandsMapping,
  green,
  MINSKY_SYSTEM_HTTP_SERVER_PATH,
  red,
  USE_MINSKY_SYSTEM_BINARY,
} from '@minsky/shared';
import axios from 'axios';
import { spawn } from 'child_process';
import { promises } from 'fs';
import * as getPort from 'get-port';
import { createInterface } from 'readline';

let minskyHttpServer = null;
let url = null;

async function initMinskyHttpService() {
  const filePath = USE_MINSKY_SYSTEM_BINARY
    ? MINSKY_SYSTEM_HTTP_SERVER_PATH
    : 'Please enter the Minsky-httpd binary path';

  const port = await getPort({ port: [7777, 7778, 7779] });

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

function showMenu() {
  console.log(
    green(`\n

      1) Check Signature
      2) Generate Signature
      3) Exit

      Select Option (1/2)
      \n`)
  );

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', async (line) => {
    const option = line.toString();

    if (option === '1') {
      console.log('\n 🚀🚀🚀🚀 Checking Signature................ 🚀🚀🚀🚀 \n');

      await checkSignature();
      return;
    }

    if (option === '2') {
      console.log(
        '\n 🚀🚀🚀🚀 Generating Signature................ 🚀🚀🚀🚀 \n'
      );

      await generateSignature();
      return;
    }

    if (option === '3') {
      rl.close();
      minskyHttpServer.emit('close');
      minskyHttpServer.kill();
      minskyHttpServer = null;

      process.kill(process.pid, 'SIGTERM');
      process.exit(1);
    }

    rl.close();
    showMenu();
  });
}

showMenu();

process.on('uncaughtException', (error) => {
  console.error(red(error));
});

process.on('unhandledRejection', (error) => {
  console.error(red(error));
});
