import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transactions';
import { transferableAbortController } from 'util';
import Transactions from '../models/Transactions';





interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const initiateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const { type, amount, paymentMethod } = req.body;

    // ❌ sécurité
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!type || !amount) {
      return res.status(400).json({
        message: 'Type and amount are required',
      });
    }

    // 📦 création transaction
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


interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const verifyTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transactionId = req.params.transactionId as string;
    const { success } = req.body;

    // ✅ vérifier ID
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 🔐 optionnel : vérifier propriétaire
    if (transaction.userId.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // ❌ éviter double vérification
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        message: `Transaction already ${transaction.status}`,
      });
    }

    // 🔥 mise à jour
    transaction.status = success ? 'completed' : 'failed';

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

export const getUserTransactions = async (req: AuthRequest, res: Response) => {
  try {
    // 🔐 récupère l'utilisateur depuis le middleware
    const userId = req.user?.id;

    // ❌ sécurité : si pas de user
    if (!userId) {
      return res.status(401).json({
        message: 'User not found or not authenticated',
      });
    }

    // 📦 récupérer les transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

    // 📊 réponse
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



export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    console.log("WEBHOOK BODY:", req.body);

    const { transactionId, status } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID required" });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // 🔥 logique de mise à jour
    if (status === "successful") {
      transaction.status = "completed";
    } else {
      transaction.status = "failed";
    }

    await transaction.save();

    return res.status(200).json({
      message: "Webhook processed successfully"
    });

  } catch (error) {
    console.error("WEBHOOK ERROR:", error);

    return res.status(500).json({
      message: "Webhook error",
      error: error instanceof Error ? error.message : error
    });
  }
};



interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const getOwnerRevenue = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        message: 'Unauthorized - user not found',
      });
    }

    // 🔥 calcul du revenu total
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



interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const refundTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transactionId = req.params.transactionId as string;

    // ✅ vérifier ID
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 🔐 optionnel : vérifier que c’est le propriétaire
    if (transaction.userId.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // ❌ déjà remboursée ou pas valide
    if (transaction.status !== 'completed') {
      return res.status(400).json({
        message: `Cannot refund a ${transaction.status} transaction`,
      });
    }

    // 🔁 mise à jour
    transaction.status = 'failed'; // ou "refunded" si tu veux améliorer ton model

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



