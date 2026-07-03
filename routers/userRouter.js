const router = require('express').Router();
const {addUser, login, profile} = require('../controller/userController');
const {auth} = require('../middleware/auth');

router.post('/addUser', addUser);
router.post('/login', login);
router.get('/profile',auth,  profile);


module.exports =router;