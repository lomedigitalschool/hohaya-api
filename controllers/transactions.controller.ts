import { Response } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transactions';
import Properties from '../models/Properties';
import { AuthRequest } from '../middlewares/authMiddleware';

const monthShortLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

// hohoya-mobile's PaymentTransaction.fromJson expects a single 'method' key
// and tracks refund progress separately from the payment status — this
// schema conflates both into one `status` (…|'refunded'). Translate here so
// every endpoint returns the same client-facing shape.
function toClientJson(transaction: any) {
    const property = transaction.propertyId;
    const isRefunded = transaction.status === 'refunded';

    return {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        method: transaction.paymentMethod,
        status: transaction.status === 'completed' || isRefunded ? 'success' : transaction.status,
        propertyId: property?._id ?? property ?? null,
        propertyTitle: property?.title ?? null,
        refundStatus: isRefunded ? 'approved' : 'none',
        refundRequestReason: isRefunded ? transaction.refundReason ?? null : null,
        refundDenialReason: null,
        createdAt: transaction.createdAt ? new Date(transaction.createdAt).toISOString() : new Date().toISOString(),
    };
}

export const initiateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { type, amount, paymentMethod, propertyId } = req.body;

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
      propertyId: propertyId || undefined,
      type,
      amount,
      status: 'pending',
      paymentMethod,
    });

    await transaction.save();
    if (transaction.propertyId) await transaction.populate('propertyId', 'title');

    return res.status(201).json(toClientJson(transaction));

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

    const transaction = await Transaction.findById(transactionId).populate('propertyId', 'title');

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

    return res.status(200).json(toClientJson(transaction));

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
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title');

    return res.status(200).json(transactions.map(toClientJson));

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

// Revenue for the connected owner's properties (rent + deposit payments
// only — visitFee/commission are platform fees, not owner income).
export const getOwnerRevenue = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.userId;

    if (!ownerId) {
      return res.status(401).json({
        message: 'Unauthorized - user not found',
      });
    }

    const ownedProperties = await Properties.find({ ownerId }).select('_id');
    const propertyIds = ownedProperties.map((p) => p._id);

    const transactions = await Transaction.find({
      propertyId: { $in: propertyIds },
      type: { $in: ['rent', 'deposit'] },
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title');

    const now = new Date();
    const sumWhere = (test: (createdAt: Date) => boolean) =>
      transactions
        .filter((t) => test(t.createdAt))
        .reduce((sum, t) => sum + t.amount, 0);

    const totalMonth = sumWhere((d) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth());
    const totalYear = sumWhere((d) => d.getFullYear() === now.getFullYear());

    const monthlyEvolution = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const amount = sumWhere((d) => d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth());
      monthlyEvolution.push({ label: monthShortLabels[month.getMonth()], amount });
    }

    return res.status(200).json({
      totalMonth,
      totalYear,
      monthlyEvolution,
      transactions: transactions.map(toClientJson),
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
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findById(transactionId).populate('propertyId', 'title');

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
    transaction.refundReason = reason;

    await transaction.save();

    return res.status(200).json(toClientJson(transaction));

  } catch (error) {
    return res.status(500).json({
      message: 'Refund error',
      error: error instanceof Error ? error.message : error,
    });
  }
};
