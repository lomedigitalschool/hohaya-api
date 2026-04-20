import mongoose, { Schema, Document } from 'mongoose';

export interface IVisit extends Document {
    propertyId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    visitDate: Date;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    message?: string;
    createdAt: Date;
}

const visitSchema: Schema = new Schema({
    propertyId: {
        type: Schema.Types.ObjectId,
        ref: "Properties"
    },
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    visitDate: Date,
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending"
    },
    message: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVisit>("Visits", visitSchema);