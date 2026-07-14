import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'rent' | 'deposit' | 'visitFee' | 'commission';
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded'; // ✅
    paymentMethod?: string;
    createdAt: Date;
}

const transactionSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    type: {
        type: String,
        enum: ["rent", "deposit", "visitFee", "commission"]
    },
    amount: Number,
    status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"] // ✅
    },
    paymentMethod: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITransaction>("Transactions", transactionSchema);