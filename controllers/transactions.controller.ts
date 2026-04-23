import { Request, Response } from 'express';
import Transaction from '../models/Transactions';

export const initiateTransaction = async (req: Request, res: Response) => {
    try {
        const transaction = await Transaction.create(req.body);
        res.status(201).json(transaction);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyTransaction = async (req: Request, res: Response) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        res.status(200).json(transaction);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserTransactions = async (req: Request, res: Response) => {
    try {
        // On récupère l'ID en haut de la fonction en "castant" req en n'importe quoi (any)
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const transactions = await Transaction.find({ user: userId });
        res.status(200).json(transactions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const handlePaymentWebhook = async (req: Request, res: Response) => {
    try {
        res.status(200).send('Webhook received');
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getOwnerRevenue = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ revenue: 0 });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const refundTransaction = async (req: Request, res: Response) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.transactionId,
            { status: 'refunded' },
            { new: true }
        );
        res.status(200).json(transaction);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};