const router = require('express').Router();
const { login, register } = require('../controllers/auth.controller.js');




// User login
router.post('/login', login)

// User register
router.post('/register', register)


module.exports = router;



