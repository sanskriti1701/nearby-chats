// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST'],
    }
});

app.use(cors());

let users = {};

io.on('connection', (socket) => {
    console.log('A user connected 🎉', socket.id);

    // Store user in the "users" object by socket ID
    users[socket.id] = { socket, nearbyUsers: [] };

    socket.on('disconnect', () => {
        console.log('User disconnected ❌', socket.id);
        delete users[socket.id];
    });

    socket.on('find-nearby', () => {
        console.log(`${socket.id} is looking for nearby users.`);
        // Send discovery request to all other users
        for (let userId in users) {
            if (userId !== socket.id) {
                users[userId].socket.emit('discovery-request', { from: socket.id });
            }
        }
    });

    socket.on('respond-to-discovery', ({ to, accept }) => {
        const targetSocket = users[to]?.socket;

        if (targetSocket) {
            if (accept) {
                console.log(`User ${socket.id} accepted discovery from ${to}`);
                // Notify the sender that the request was accepted
                targetSocket.emit('discovery-response', { from: socket.id });

                // Now create a private chat room between the two users
                const roomName = `room-${socket.id}-${to}`;
                socket.join(roomName);
                targetSocket.join(roomName);

                // Notify both users that a chat session has been established
                io.to(socket.id).emit('chat-connected', { roomName });
                io.to(to).emit('chat-connected', { roomName });
            } else {
                console.log(`User ${socket.id} rejected discovery from ${to}`);
                // Notify the sender that the request was rejected
                targetSocket.emit('discovery-rejected', { from: socket.id });
            }
        }
    });

    socket.on('chat-message', ({ roomName, message }) => {
        console.log(`Message from ${socket.id} to room ${roomName}: ${message}`);
        io.to(roomName).emit('chat-message', { from: socket.id, message });
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
