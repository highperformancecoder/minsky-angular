const express = require('express')
const app = express()

const http = require('http')
const server = http.Server(app)

const socketIO = require('socket.io')
const io = socketIO(server)

const port = process.env.PORT || 3000

io.on('connection', (socket) => {
	console.log('user connected')
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
