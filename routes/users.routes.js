const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {findUsers ,createUsers ,userProfile} = require('../controllers/users.controller');




// Find Users route
router.get('/' ,findUsers);

// Create User route
router.post('/create', createUsers);

// User Profile 
router.get('/profile',authMiddleware,roleMiddleware('owner'), userProfile);









module.exports = router;