const { sendChat } = require('../services/chatServices');

const addChat = async (req, res, next) => {
    try {
        const { message, userId } = req.body;

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

module.exports = {
    addChat,
}
