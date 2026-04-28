import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transactions';
import { transferableAbortController } from 'util';
import Transactions from '../models/Transactions';



export const initiateTransaction = async (req: Request, res: Response) => {
  try {
    const { userId, type, amount, paymentMethod } = req.body;

    // 🔍 Validation
    if (!userId || !type || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['rent', 'deposit', 'visitFee', 'commission'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // 🧾 Création transaction
    const transaction = await Transaction.create({
      userId,
      type,
      amount,
      status: 'pending', // 🔒 toujours forcé ici
      paymentMethod,
    });

    return res.status(201).json({
      message: 'Transaction initiated successfully',
      data: transaction,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error,
    });
  }
};

export const verifyTransaction = async (req: Request, res: Response) => {
  try {
    const { transactionId, success } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    // 🔍 chercher la transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 🔒 éviter double traitement
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        message: `Transaction already ${transaction.status}`,
      });
    }

    // 🔄 mise à jour du status
    transaction.status = success ? 'completed' : 'failed';

    await transaction.save();

    return res.status(200).json({
      message: 'Transaction verified successfully',
      data: transaction,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error,
    });
  }
};



export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // 🔍 validation
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // 📦 récupération des transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 }); // les plus récentes d'abord

    return res.status(200).json({
      message: 'User transactions fetched successfully',
      count: transactions.length,
      data: transactions,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error,
    });
  }
};



export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // 👉 Exemple générique (adapter selon ton provider)
    const { transactionId, status } = payload;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID missing' });
    }

    // 🔍 chercher la transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 🔒 éviter double traitement
    if (transaction.status !== 'pending') {
      return res.status(200).json({
        message: 'Transaction already processed',
      });
    }

    // 🔄 mise à jour
    if (status === 'successful') {
      transaction.status = 'completed';

      // 💰 logique métier
      // ex: créditer wallet
      // ex: marquer loyer payé

    } else {
      transaction.status = 'failed';
    }

    await transaction.save();

    return res.status(200).json({
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Webhook error',
      error,
    });
  }
};

export const getOwnerRevenue = async (req: Request, res: Response) => {
  try {
    const ownerId = req.params.ownerId as string; // ✅ FIX

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: 'Invalid owner ID' });
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(ownerId),
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]);

    const totalRevenue = result[0]?.totalRevenue || 0;

    return res.status(200).json({ totalRevenue });

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};



export const refundTransaction = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    // 🔍 chercher la transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // ❌ doit être completed
    if (transaction.status !== 'completed') {
      return res.status(400).json({
        message: 'Only completed transactions can be refunded',
      });
    }

    // 🔒 éviter double refund
    if ((transaction as any).refunded) {
      return res.status(400).json({
        message: 'Transaction already refunded',
      });
    }

    // 👉 ICI (PROD) : appeler ton provider
    // await refundWithFlutterwave(transaction.providerRef);

    // 🔄 mise à jour
    transaction.status = 'failed'; // ou "refunded" si tu ajoutes ce status
    (transaction as any).refunded = true;
    (transaction as any).refundDate = new Date();

    await transaction.save();

    return res.status(200).json({
      message: 'Transaction refunded successfully',
      data: transaction,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Refund failed',
      error,
    });
  }
};