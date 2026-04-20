
const router = require('express').Router()


const {
    createVisits , 
    findTenantVisits, 
    findOwnerVisits, 
    visitAgrement ,
    visitPopulate,
    visitsStats
} = require('../controllers/visits.controller')







// MIDDLEWARE
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');


//ROUTES

// Create Visits
router.post('/visits' ,authMiddleware,roleMiddleware("tenant"),createVisits)


// Find Visits of Tenant
router.get('/tenant/visits' ,authMiddleware,roleMiddleware("tenant"),findTenantVisits)


// Find Visits of Owner
router.get('/owner/visits',authMiddleware,roleMiddleware("owner"),findOwnerVisits )


// Accept or Refuse a Visit
router.put('/visits/:id',authMiddleware,roleMiddleware("owner"),visitAgrement) 


//Get super infos of visits with popuplate 
router.get('/visits/populate' ,visitPopulate)


// Stats : number of visits per property
router.get('/visits/stats' ,visitsStats )





module.exports = router;
