import { Router } from 'express';
import auth from '../middlewares/authMiddleware';
import {
    createVisits,
    findTenantVisits,
    findOwnerVisits,
    getVisitById,
    visitAgrement,
    cancelVisit,
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

// Keep these last: /:id would otherwise swallow the static paths above.
router.get('/:id', auth, getVisitById);
router.delete('/:id', auth, cancelVisit);

export default router;
