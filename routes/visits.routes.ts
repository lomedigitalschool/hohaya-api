import { Router } from 'express';
import {
    createVisits,
    findTenantVisits,
    findOwnerVisits,
    visitAgrement,
    visitPopulate,
    visitsStats
} from '../controllers/visits.controller';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

// Create Visits
router.post('/visits', authMiddleware, roleMiddleware("tenant"), createVisits);

// Find Visits of Tenant
router.get('/tenant/visits', authMiddleware, roleMiddleware("tenant"), findTenantVisits);

// Find Visits of Owner
router.get('/owner/visits', authMiddleware, roleMiddleware("owner"), findOwnerVisits);

// Accept or Refuse a Visit
router.put('/visits/:id', authMiddleware, roleMiddleware("owner"), visitAgrement);

// Get super infos of visits with populate 
router.get('/visits/populate', visitPopulate);

// Stats : number of visits per property
router.get('/visits/stats', visitsStats);

export default router;
