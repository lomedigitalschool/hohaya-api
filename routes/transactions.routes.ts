import { Router } from 'express';
import {
    payVisits,
    gainPerType
} from '../controllers/transactions.controller';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

// pay visit Route
router.post('/pay-visit', authMiddleware, roleMiddleware("tenant"), payVisits);

// Stats : total revenue per type
router.get('/gain', gainPerType);

export default router;