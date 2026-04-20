import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
    ownerId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    type: 'room' | 'house' | 'apartment' | 'land';
    price: number;
    rooms?: number;
    location: {
        city: string;
        district: string;
        address: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    images: string[];
    status: 'active' | 'rented' | 'sold' | 'archived';
    isApproved: boolean;
    createdAt: Date;
}

const propertySchema: Schema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    title: String,
    description: String,
    type: {
        type: String,
        enum: ["room", "house", "apartment", "land"]
    },
    price: Number,
    rooms: Number,
    location: {
        city: String,
        district: String,
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    images: [String],
    status: {
        type: String,
        enum: ["active", "rented", "sold", "archived"],
        default: "active"
    },
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProperty>("Properties", propertySchema);