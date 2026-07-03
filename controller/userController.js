
const { createUser, loginUser } = require('../services/userServices');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addUser = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const response = await createUser({ name, email, phone, password });

        return res.status(201).json({
            success: true,
            message: "User has been registered Successfully...!",
            data: response
        });

    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const response = await loginUser({ email, password });

        const token = jwt.sign(
            { id: response.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE_IN }
        );


        res.cookie('token', token, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login Success...!",
            data: response.data
        });

    } catch (error) {
        next(error);
    }
}

const profile = async (req, res, next) => {
    try {

        if(!req.user){
            return res.status(401).json({
                success: false,
                message: "user not logged in..."
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User Authenticated successfully...',
            data: req.user
        });

    } catch (error) {
        next(error);
    }
}
module.exports = {
    addUser,
    login,
    profile
}