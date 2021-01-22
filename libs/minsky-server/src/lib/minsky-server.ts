import * as debug from 'debug';
import * as express from 'express';
import * as http from 'http';
import * as os from 'os';
import * as socketIO from 'socket.io';
const app = express();

const logUiEvent = debug('minsky:ui_event');
const logServerEvent = debug('minsky:server');

const server = new http.Server(app);

const io = socketIO(server);
const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
  logUiEvent('User connected');

  socket.on('HEADER_EVENT', (message) => {
    switch (message.target) {
      case 'RECORD_BUTTON':
        logUiEvent('record button clicked');
        socket.emit('RESPONSE', { msg: 'Recording Started' });
        break;

      case 'REFRESH_BUTTON':
        logUiEvent('refresh button clicked');
        // TODO: send updated canvas
        socket.emit('RESPONSE', { msg: 'Refreshing' });
        break;

      case 'RECORDING_REPLAY_BUTTON':
        logUiEvent('Recording replay button clicked');
        socket.emit('RESPONSE', { msg: 'Recording Replay Started' });
        break;

      case 'REVERSE_CHECKBOX_BUTTON':
        logUiEvent('Reverse checkbox button clicked');
        socket.emit('RESPONSE', { msg: 'Reverse checked' });
        break;

      case 'STOP_BUTTON':
        logUiEvent('Stop button clicked');
        socket.emit('RESPONSE', { msg: 'Recording Stop' });
        break;

      case 'STEP_BUTTON':
        logUiEvent('Step button clicked');
        socket.emit('RESPONSE', { msg: 'Recording Step' });
        break;

      case 'ZOOMOUT_BUTTON':
        logUiEvent('ZoomOut button clicked');
        socket.emit('RESPONSE', { msg: 'ZoomOut' });
        break;

      case 'ZOOMIN_BUTTON':
        logUiEvent('ZoomIn button clicked');
        socket.emit('RESPONSE', { msg: 'ZoomIn' });
        break;

      case 'RESET_BUTTON':
        logUiEvent('Reset button clicked');
        socket.emit('RESPONSE', { msg: 'Reset Recording' });
        break;

      case 'RESETZOOM_BUTTON':
        logUiEvent('Reset zoom button clicked');
        socket.emit('RESPONSE', { msg: 'Reset Zoom' });
        break;

      case 'ZOOMTOFIT_BUTTON':
        logUiEvent('Zoom to fit button clicked');
        socket.emit('RESPONSE', { msg: 'Zoom Fit' });
        break;

      case 'SIMULATION_SPEED':
        logUiEvent('Simulation speed clicked');
        socket.emit('RESPONSE', { msg: 'Updating Simulation Speed' });
        break;
    }
  });

  socket.on('canvasEvent', (data) => {
    // code for mouse events
    if (data.type !== 'mousemove') {
      logUiEvent('Canvas Event: ', data);
    }
    socket.broadcast.emit('canvasEvent', data);
  });

  socket.on('Values', (data) => {
    // code for x11 window, left/top offset, window size
    if (Buffer.isBuffer(data)) {
      const offset = 0;

      const windowId =
        os.endianness() == 'LE'
          ? data.readInt32LE(offset)
          : data.readInt32BE(offset);

      logUiEvent('Buffer :', data, ' window id = ', windowId);
    } else {
      logUiEvent('Values :', data);
    }
    socket.broadcast.emit(data);
  });
});

io.on('new-message', (message) => {
  io.emit(message);
});

export async function startServer(/* {
  serverPortRangeStart,
  serverPortRangeEnd,
} */) {
  /* const port = await getPort({
    port: getPort.makeRange(serverPortRangeStart, serverPortRangeEnd),
  }); */

  server.listen(port, () => {
    // process.env.serverPort = 'port';
    logServerEvent(`Started on port: ${port}`);
  });
}
