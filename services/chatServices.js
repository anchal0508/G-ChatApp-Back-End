const { Chat } = require('../models/index');

const sendChat = async (chatMessage) => {
    return await Chat.create({
        message: chatMessage.message,
        userId: chatMessage.userId  
    });
}

const myMessage = async (userId) => {
    const response = await Chat.findAll();

    return response;
}

module.exports = {
    sendChat,
    myMessage
}
