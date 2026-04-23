import { Router } from 'express';
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
router.get('/:transactionId/verify', verifyTransaction);
router.get('/user/me', getUserTransactions);
router.post('/webhook', handlePaymentWebhook);
router.get('/owner/revenue', getOwnerRevenue);
router.post('/:transactionId/refund', refundTransaction);

export default router;