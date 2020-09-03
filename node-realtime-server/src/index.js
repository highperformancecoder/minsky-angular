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
