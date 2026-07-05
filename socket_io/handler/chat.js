

module.exports = (socket, io) => {
    console.log(`✅ User connected : ${socket.id} | Name: ${socket.user?.name || 'Unknown'}`);

    socket.on('send_message', (msg) => {
        socket.broadcast.emit('receive_message', msg);
    });

    socket.on('disconnect', () => {
        console.log(' User disconnected: ', socket.id);
    });
}