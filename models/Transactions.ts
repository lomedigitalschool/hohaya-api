import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    propertyId?: mongoose.Types.ObjectId;
    type: 'rent' | 'deposit' | 'visitFee' | 'commission';
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded'; // ✅
    paymentMethod?: string;
    refundReason?: string;
    createdAt: Date;
}

const transactionSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    // Which listing this payment relates to (rent/deposit) — absent for
    // platform-level transactions like commission.
    propertyId: {
        type: Schema.Types.ObjectId,
        ref: "Properties"
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
    refundReason: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITransaction>("Transactions", transactionSchema);