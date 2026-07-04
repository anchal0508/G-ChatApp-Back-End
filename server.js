require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./models/index');

const http = require('http'); 

const { Server } = require('socket.io'); 


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`⚡ User connected to live chat: ${socket.id}`);

    socket.on('send_message', (data) => {
        socket.broadcast.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

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


const PORT = process.env.PORT || 3000;
db.sequelize.authenticate()
    .then(() => {
        server.listen(PORT, "0.0.0.0", () => console.log(`Online on port ${PORT}... and Connected with Supabase...`));
    })
    .catch((err) => {
        console.log("------------ Unable to connect with DB ------------", err.stack);
    });
