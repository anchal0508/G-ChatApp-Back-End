require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models/index');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const { User } = require('./models/index');
const jwt = require('jsonwebtoken');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.use(async (socket, next) => {
    try {
        const rawCookies = socket.handshake.headers.cookie;

        if (!rawCookies) {
            console.log("Socket reject: cookie is missing");
            return next(new Error('Auth error: Cookies missing'));
        }

        let token = null;

        if (rawCookies.includes('=')) {
            const cookiePairs = rawCookies.split(';');
            for (let pair of cookiePairs) {
                const [key, value] = pair.split('=');
                const trimmedKey = key.trim();

                if (trimmedKey === 'token' || trimmedKey === 'jwt') {
                    token = value ? value.trim() : null;
                    break;
                }
            }
        }
        else {
            token = rawCookies.trim();
        }

        if (!token) {
            console.log("Token is missing in the cookie");
            return next(new Error('Auth error: Token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const checkUser = await User.findByPk(decoded.id);
        if (!checkUser) {
            console.log(" User not found in database");
            return next(new Error('User not found'));
        }

        socket.user = checkUser;
        next();

    } catch (error) {
        console.error(" Socket Middleware error:", error.message);
        return next(new Error('Auth error: Invalid token'));
    }
});

io.on('connection', socket => {
    console.log(`✅ User connected : ${socket.id} | Name: ${socket.user?.name || 'Unknown'}`);

    socket.on('send_message', (msg) => {
        socket.broadcast.emit('receive_message', msg);
    });

    socket.on('disconnect', () => {
        console.log(' User disconnected: ', socket.id);
    });
});

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

const PORT = process.env.PORT || 3000;
db.sequelize.authenticate()
    .then(() => {
        server.listen(PORT, () => console.log(`Online on port ${PORT}... and Connected with Supabase...`));
    })
    .catch((err) => {
        console.log("------------ Unable to connect with DB ------------", err.stack);
    });
