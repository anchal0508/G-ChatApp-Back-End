

module.exports = (socket, io) => {

    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.user?.name || socket.id} joined room: ${roomName}`);
    });

    console.log(`✅ User connected : ${socket.id} | Name: ${socket.user?.name || 'Unknown'}`);

    socket.on("new-message", ({ msg, roomName }) => {

        const messagePayload = {
            id: Date.now(),
            message: msg,
            userId: socket.user?.id || null,
            senderName: socket.user?.name || 'Unknown',
            createdAt: new Date().toISOString()
        };
        io.to(roomName).emit('receive_message', messagePayload);

        socket.broadcast.emit('receive_message', msg);
    });

    socket.on('disconnect', () => {
        console.log(' User disconnected: ', socket.id);
    });
}