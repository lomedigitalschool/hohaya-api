import { Router } from 'express';
import auth from '../middlewares/authMiddleware';
import {
    createVisits,
    findTenantVisits,
    findOwnerVisits,
    visitAgrement,
    visitPopulate,
    visitsStats
} from '../controllers/visits.controller';

const router = Router();

router.post('/', auth, createVisits);
router.get('/tenant/me', auth, findTenantVisits);
router.get('/owner/me', auth, findOwnerVisits);
router.patch('/:id/agreement', auth, visitAgrement);
router.get('/populate', auth, visitPopulate);
router.get('/stats', auth, visitsStats);

export default router;
