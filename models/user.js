'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const {Chat}= require('./index');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Chat, {
        foreignKey: 'userId',
        as: 'chats'
      });
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const saltAround = parseInt(process.env.PASSWORD_SALT || 12);
          user.password = await bcrypt.hash(user.password, saltAround);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const saltAround = parseInt(process.env.PASSWORD_SALT || 12);
          user.password = await bcrypt.hash(user.password, saltAround);
        }
      }
    }
  });
  return User;
};