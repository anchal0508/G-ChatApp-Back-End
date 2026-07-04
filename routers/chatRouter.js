const router = require('express').Router();
const {addChat, getMessage} = require('../controller/chatController');
const {auth} = require('../middleware/auth');

router.post('/addChat', auth, addChat);
router.get('/getmsg', auth, getMessage);


module.exports =router;