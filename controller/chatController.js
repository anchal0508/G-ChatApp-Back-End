const { sendChat , myMessage} = require('../services/chatServices');

const addChat = async (req, res, next) => {
    try {
        const { message } = req.body;
        const user = req.user;

        const response = await sendChat({ message, userId });

        return res.status(200).json({
            success: true,
            message: 'Message Sent...',
            data: response
        });
    } catch (error) {
        next(error);
    }
}

const getMessage = async (req, res, next) => {
    try {
        const id = req.user.id;
        
        const response = await myMessage({id});

        return res.status(200).json({
            success: true,
            message: 'message recieved',
            data: response
        })
    } catch (error) {
        next(error);
    }
}
module.exports = {
    addChat,
    getMessage
}
