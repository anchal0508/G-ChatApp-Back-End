

module.exports = (socket, io) => {
    console.log(`User connected : ${socket.id} | Name: ${socket.user?.name || 'Unknown'}`);

    socket.on('send_message', (msg) => {
        socket.broadcast.emit('receive_public_message', msg);
        // console.log("User", socket.user.senderName, "said:", msg);
    });

    socket.on('disconnect', () => {
        console.log(' User disconnected: ', socket.id);
    });
}