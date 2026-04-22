const express = require('express');
const router = express.Router();
const {
    initiateTransaction,
    verifyTransaction,
    getUserTransactions,
    handlePaymentWebhook,
    getOwnerRevenue,
    refundTransaction
} = require('../controllers/transactionController');

router.post('/initiate', initiateTransaction);
router.get('/:transactionId/verify', verifyTransaction);
router.get('/user/me', getUserTransactions);
router.post('/webhook', handlePaymentWebhook);
router.get('/owner/revenue', getOwnerRevenue);
router.post('/:transactionId/refund', refundTransaction);

module.exports = router;