const { Server } = require('socket.io');
const socketAuth = require('./middleware');
const chatHandler = require('./handler/chat');
const cookieParser = require('cookie-parser');

module.exports = (server) => {

    const io = new Server(server, {

        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }

    });

  
    
   
    socketAuth(io);



io.on('connection', socket => {
   chatHandler(socket, io);
});

return io;

}