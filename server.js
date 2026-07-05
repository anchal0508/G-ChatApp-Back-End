require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models/index');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const server = http.createServer(app);
const sockteIO = require('./socket_io/index');


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());






const userRouter = require('./routers/userRouter');
const chatRouter = require('./routers/chatRouter');


app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);

const myCookieParser = cookieParser();

app.use(myCookieParser);
const io = sockteIO(server);
io.engine.use(myCookieParser);



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
