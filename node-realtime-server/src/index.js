const express = require('express')
const app = express()

const http = require('http')
const server = http.Server(app)

const socketIO = require('socket.io')
const io = socketIO(server)

const port = process.env.PORT || 3000

io.on('connection', (socket) => {
	console.log('user connected')
})

io.on('new-message', (message) => {
	io.emit(message)
})

server.listen(port, () => {
	console.log(`started on port: ${port}`)
})
