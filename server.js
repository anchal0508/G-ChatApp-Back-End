require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./models/index');

const http = require('http');

const { Server } = require('socket.io');   // ----------------------------------------------------------------------


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ----------------------------------- socket ----------------------------------------------------------------------
io.use(async (socket, next) => {
    try {
        let token = null;

        if (socket.handshake.headers.cookie) {
            const parsedCookies = cookie.parse(socket.handshake.headers.cookie);
            token = parsedCookies.token;
        }

        if (!token && socket.handshake.auth && socket.handshake.auth.token) {
            token = socket.handshake.auth.token;
        }

        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const dbUser = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!dbUser) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.user = dbUser;
        next();

    } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
    }
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    
    if (!socket.user) {
        console.log(`⚠️ Connection rejected: Unauthenticated context (${socket.id})`);
        socket.disconnect(true);
        return;
    }

    console.log(`⚡ User authenticated & connected: ${socket.user.name} (Socket ID: ${socket.id})`);

    socket.on('send_message', (data) => {
        const messagePayload = {
            id: data.id || Date.now(),
            message: data.message,
            userId: socket.user.id,        
            senderName: socket.user.name,   
            createdAt: data.createdAt || new Date().toISOString()
        };

        io.emit('receive_message', messagePayload);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.id}`);
    });
});

// ----------------------------------- socket ----------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const userRouter = require('./routers/userRouter');
const chatRouter = require('./routers/chatRouter');

app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message;
    console.log(err.stack);

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});


// ----------------------------------- insted of app.listen using app.server ----------------------------------------------------------------------


const PORT = process.env.PORT || 3000;
db.sequelize.authenticate()
    .then(() => {
        server.listen(PORT, "0.0.0.0", () => console.log(`Online on port ${PORT}... and Connected with Supabase...`));
    })
    .catch((err) => {
        console.log("------------ Unable to connect with DB ------------", err.stack);
    });
