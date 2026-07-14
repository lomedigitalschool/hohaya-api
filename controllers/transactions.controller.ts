import { Response } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transactions';
import { AuthRequest } from '../middlewares/authMiddleware';

export const initiateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { type, amount, paymentMethod } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!type || !amount) {
      return res.status(400).json({
        message: 'Type and amount are required',
      });
    }

    const transaction = new Transaction({
      userId,
      type,
      amount,
      status: 'pending',
      paymentMethod,
    });

    await transaction.save();

    return res.status(201).json({
      message: 'Transaction initiated successfully',
      data: transaction,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error initiating transaction',
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const verifyTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transactionId = req.params.transactionId as string;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        message: `Transaction already ${transaction.status}`,
      });
    }

    const isPaymentValid = await verifyPaymentWithProvider(transactionId);
    transaction.status = isPaymentValid ? 'completed' : 'failed';

    await transaction.save();

    return res.status(200).json({
      message: 'Transaction verified successfully',
      data: transaction,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Verification error',
      error: error instanceof Error ? error.message : error,
    });
  }
};

const verifyPaymentWithProvider = async (transactionId: string): Promise<boolean> => {
  // Ex: const response = await stripe.paymentIntents.retrieve(transactionId);
  // return response.status === 'succeeded';
  return true; // placeholder
};

export const getUserTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User not found or not authenticated',
      });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
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

export const handlePaymentWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID required' });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = status === 'successful' ? 'completed' : 'failed';

    await transaction.save();

    return res.status(200).json({
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Webhook error',
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getOwnerRevenue = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.userId;

    if (!ownerId) {
      return res.status(401).json({
        message: 'Unauthorized - user not found',
      });
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(ownerId),
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

    return res.status(200).json({
      totalRevenue,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const refundTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transactionId = req.params.transactionId as string;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({
        message: `Cannot refund a ${transaction.status} transaction`,
      });
    }

    transaction.status = 'refunded';

    await transaction.save();

    return res.status(200).json({
      message: 'Transaction refunded successfully',
      data: transaction,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Refund error',
      error: error instanceof Error ? error.message : error,
    });
  }
};