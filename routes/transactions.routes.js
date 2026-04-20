

const router = require('express').Router()
const {payVisits,
    gainPerType
} = require('../controllers/transactions.controller')



// MIDDLEWARE
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');




// pay visit Route
router.post('/pay-visit',authMiddleware,roleMiddleware("tenant") ,payVisits)



// Stats : total revenue per type
router.get('/gain' ,gainPerType)


module.exports = router;