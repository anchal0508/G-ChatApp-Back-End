
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');


const auth = async (req, res, next) => {
    try {
        const token = req.cookies ? req.cookies.token : null;

        if (!token) {
            const error = new Error('Token not available in auth faild')
            error.statusCode = 401;
            throw error;
        }

        const check = jwt.verify(token, process.env.JWT_SECRET);
        const dbUser = await User.findByPk(check.id, {
            attributes: { exclude: ['password'] }
        });

        if (!dbUser) {
            const error = new Error('User not available');
        }

        req.user = dbUser;

        next();

    } catch (error) {
        next(error)
    }
}



module.exports = {
    auth
};