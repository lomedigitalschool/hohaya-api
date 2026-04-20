import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Visits from "../models/Visits";
import Transactions from "../models/Transactions";

// Visit pay
export async function payVisits(req: AuthRequest, res: Response) {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const { visitId, amount } = req.body;

            const visit = await Visits.findById(visitId).session(session);

            if (!visit) { throw new Error("Visit not found"); }

            // créer transaction
            await Transactions.create([{
                userId: req.user.userId,
                type: "visitFee",
                amount,
                status: "completed",
                paymentMethod: "mobileMoney"
            }], { session });

            // mettre à jour la visite
            visit.status = "accepted";
            await visit.save({ session });
        });

        res.json({ message: "Payment successful" });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
}

// Stats : total revenue per type
export async function gainPerType(req: AuthRequest, res: Response) {
    try {
        const revenue = await Transactions.aggregate([
            {
                $match: { status: "completed" }
            },
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);
        res.json(revenue);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}