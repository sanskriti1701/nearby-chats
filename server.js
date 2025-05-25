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
    console.log('🎉 A user connected:', socket.id);

    socket.onAny((event, ...args) => {
        console.log(`⚡️ [onAny] Event received: '${event}', Data:`, args);
    });

    users[socket.id] = { socket, name: null };

    socket.on('set-username', (name) => {
        users[socket.id].name = name;
        console.log(`✅ Username set for ${socket.id}: ${name}`);
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
        delete users[socket.id];
    });

    socket.on("find-nearby", (data) => {
        console.log("🔥 find-nearby triggered. Payload:", data);

        const name = data?.name || "Unknown";
        users[socket.id].name = name;

        console.log(`📡 ${socket.id} (${name}) is looking for nearby users.`);

        for (let userId in users) {
            if (userId !== socket.id) {
                users[userId].socket.emit('discovery-request', {
                    from: socket.id,
                    name: users[socket.id].name || "Unknown"
                });
            }
        }
    });

    socket.on('respond-to-discovery', ({ to, accept }) => {
        const targetSocket = users[to]?.socket;

        if (targetSocket) {
            if (accept) {
                console.log(`👍 ${socket.id} accepted discovery from ${to}`);
                targetSocket.emit('discovery-response', {
                    from: socket.id,
                    name: users[socket.id].name || "Unknown"
                });
            } else {
                console.log(`👎 ${socket.id} rejected discovery from ${to}`);
                targetSocket.emit('discovery-rejected', {
                    from: socket.id
                });
            }
        }
    });

    socket.on('send-message', ({ to, message }) => {
        const targetSocket = users[to]?.socket;
        if (targetSocket) {
            targetSocket.emit('new-message', {
                from: socket.id,
                name: users[socket.id].name || "Unknown",
                message
            });
        }
    });
});

server.listen(3000, () => {
    console.log('🚀 Server listening on port 3000');
});
