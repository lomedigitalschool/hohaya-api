
const router = require('express').Router();
const {
    createProperties ,
    findProperties , 
    propertiesStats
} = require('../controllers/properties.controller')



// Create Properties
router.post('/create/properties' , createProperties);


// FInd Properties
router.get('/properties',findProperties)



// Stats : number of properties per location
router.get('/property-stats' ,propertiesStats)





module.exports = router;