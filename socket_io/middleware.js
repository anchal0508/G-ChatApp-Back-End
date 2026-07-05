const { User } = require('../models/index');
const jwt = require('jsonwebtoken');

module.exports = (io) => {

    io.use(async (socket, next) => {
        try {
            const rawCookies = socket.handshake.headers.cookie;

            if (!rawCookies) {
                console.log("Socket reject: cookie is missing");
                return next(new Error('Auth error: Cookies missing'));
            }

            let token = null;

            if (rawCookies.includes('=')) {
                const cookiePairs = rawCookies.split(';');
                for (let pair of cookiePairs) {
                    const [key, value] = pair.split('=');
                    const trimmedKey = key.trim();

                    if (trimmedKey === 'token' || trimmedKey === 'jwt') {
                        token = value ? value.trim() : null;
                        break;
                    }
                }
            }
            else {
                token = rawCookies.trim();
            }

            if (!token) {
                console.log("Token is missing in the cookie");
                return next(new Error('Auth error: Token missing'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const checkUser = await User.findByPk(decoded.id);
            if (!checkUser) {
                console.log(" User not found in database");
                return next(new Error('User not found'));
            }

            socket.user = checkUser;
            next();

        } catch (error) {
            console.error(" Socket Middleware error:", error.message);
            return next(new Error('Auth error: Invalid token'));
        }
    });
}