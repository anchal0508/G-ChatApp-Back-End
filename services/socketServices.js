const { Server, Socket } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.token
        if (!token) {
            return next(new Error('Authenticatio error: Token missing'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();

        } catch (error) {
            return next(new Error('Authentication error: Invalid tooken'));
        }
    });

    // socket Connection and Events

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.id} (socket ID: ${socket.id})`);
        socket.join(`user_${socket.user.id}`);

        socket.on('join_room')
    })
}