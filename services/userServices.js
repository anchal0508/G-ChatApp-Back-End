const { where } = require('sequelize');
const { User } = require('../models/index');
const bcrypt = require('bcryptjs');

const createUser = async (userData) => {
    const { email } = userData;

    const existingUser = await User.findOne({
        where: {
            email: email
        }
    });

    if (existingUser) {
        const error = new Error('User already exists, try to login');
        error.statusCode = 400;
        throw error;
    }


    const response = await User.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
    });

    return response;
}

const loginUser = async (userDetail) => {
    const { email } = userDetail;

    const existingUser = await User.findOne({
        where: {
            email: email
        }
    });

    if (!existingUser) {
        const error = new Error('User not awailable...');
        error.statusCode = 400;
        throw error;
    }

    const validUser = await bcrypt.compare(userDetail.password, existingUser.password);
    if (validUser) {
        return existingUser;
    }
    else {
        const error = new Error('Invalid user');
        error.statusCode = 401;
        throw error;
    }
}


module.exports = {
    createUser,
    loginUser,
    

}