import { Router } from 'express';
import  authMiddleware  from '../middlewares/authMiddleware';
import {
    initiateTransaction,
    verifyTransaction,
    getUserTransactions,
    handlePaymentWebhook,
    getOwnerRevenue,
    refundTransaction
} from '../controllers/transactions.controller';

const router = Router();

router.post('/initiate', initiateTransaction);
router.patch('/:transactionId/verify', verifyTransaction);
router.get('/user/me', authMiddleware, getUserTransactions);
router.post('/webhook', handlePaymentWebhook);
router.get('/owner/revenue', authMiddleware, getOwnerRevenue);
router.post('/:transactionId/refund', authMiddleware, refundTransaction);

export default router;