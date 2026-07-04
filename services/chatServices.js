const { Chat } = require('../models/index');

const sendChat = async (chatMessage) => {
    return await Chat.create({
        message: chatMessage.message,
        userId: chatMessage.id  
    });
}

const myMessage = async (userId) => {
    const response = await Chat.findAll({
        where: {
            userId:userId.id
        }
    });

    return response;
}

module.exports = {
    sendChat,
    myMessage
}
