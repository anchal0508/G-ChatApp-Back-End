const router = require('express').Router();
const {addChat} = require('../controller/chatController');
const {auth} = require('../middleware/auth');

router.post('/addChat', auth, addChat);


module.exports =router;