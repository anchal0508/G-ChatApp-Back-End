require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models/index');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const http = require('http');

const { Server } = require('socket.io');

const cookie = require('cookie');
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


io.on('connection', socket => {
    console.log('User connected : ', socket.id);

    socket.on('send_message', (msg) => {
        socket.broadcast.emit('receive_message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    });
})




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