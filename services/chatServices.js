const { Chat } = require('../models/index');

const sendChat = async (chatMessage) => {
    return await Chat.create({
        message: chatMessage.message,
        userId: chatMessage.userId  
    });
}

module.exports = {
    sendChat,
}
