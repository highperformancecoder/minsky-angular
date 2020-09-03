const express = require('express')
const app = express()

const http = require('http')
const server = http.Server(app)

const socketIO = require('socket.io')
const io = socketIO(server)

const port = process.env.PORT || 3000

io.on('connection', (socket) => {
	console.log('user connected')
	socket.on('HEADER_EVENT', (message) => {
		switch (message.target) {
			case 'RECORD_BUTTON':
				console.log('record button clicked')
				socket.emit('RESPONSE', { msg: 'Recording Started' })
				break
			case 'REFRESH_BUTTON':
				console.log('refresh button clicked')
				// TODO: send updated canvas
				socket.emit('RESPONSE', { msg: 'Refreshing' })
				break
			case 'RECORDING_REPLAY_BUTTON':
				console.log('Recording replay button clicked')
				socket.emit('RESPONSE', { msg: 'Recording Replay Started' })
				break
			case 'REVERSE_CHECKBOX_BUTTON':
				console.log('Reverse checkbox button clicked')
				socket.emit('RESPONSE', { msg: 'Reverse checked' })
				break
			case 'STOP_BUTTON':
				console.log('Stop button clicked')
				socket.emit('RESPONSE', { msg: 'Recording Stop' })
				break
			case 'STEP_BUTTON':
				console.log('Step button clicked')
				socket.emit('RESPONSE', { msg: 'Recording Step' })
				break
			case 'ZOOMOUT_BUTTON':
				console.log('ZoomOut button clicked')
				socket.emit('RESPONSE', { msg: 'ZoomOut' })
				break
			case 'ZOOMIN_BUTTON':
				console.log('ZoomIn button clicked')
				socket.emit('RESPONSE', { msg: 'ZoomIn' })
				break
			case 'RESET_BUTTON':
				console.log('Reset button clicked')
				socket.emit('RESPONSE', { msg: 'Reset Recording' })
				break
			case 'RESETZOOM_BUTTON':
				console.log('Reset zoom button clicked')
				socket.emit('RESPONSE', { msg: 'Reset Zoom' })
				break
			case 'ZOOMTOFIT_BUTTON':
				console.log('Zoom to fit button clicked')
				socket.emit('RESPONSE', { msg: 'Zoom Fit' })
				break
			case 'SIMULATION_SPEED':
				console.log('Simulation speed clicked')
				socket.emit('RESPONSE', { msg: 'Updating Simulation Speed' })
				break
		}
	})

	socket.on('canvasClick', (data) => {
		console.log('canvasClick in server.js')
		// console.log(socket);
		console.log(data)
		socket.broadcast.emit('canvasClick', data)
	})
})

io.on('new-message', (message) => {
	io.emit(message)
})

server.listen(port, () => {
	console.log(`started on port: ${port}`)
})
