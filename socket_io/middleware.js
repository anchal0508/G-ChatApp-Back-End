const { User } = require('../models/index');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.request.cookies?.token || socket.request.cookies?.jwt;

            if (!token) {
                console.log("Socket reject: token is missing in cookies");
                return next(new Error('Auth error: Token missing'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const checkUser = await User.findByPk(decoded.id);
            if (!checkUser) {
                console.log("User not found in database");
                return next(new Error('User not found'));
            }

            socket.user = checkUser;
            next();

        } catch (error) {
            console.error("Socket Middleware error:", error.message);
            return next(new Error('Auth error: Invalid token'));
        }
    });
};
