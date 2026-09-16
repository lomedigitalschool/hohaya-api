import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
    ownerId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    type: 'room' | 'house' | 'apartment' | 'land' | 'villa' | 'studio' | 'office' | 'commercial';
    price: number;
    priceType: 'location' | 'vente';
    deposit: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
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
    status: 'pending' | 'active' | 'rented' | 'sold' | 'archived';
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
        enum: ["room", "house", "apartment", "land", "villa", "studio", "office", "commercial"]
    },
    price: Number,
    priceType: {
        type: String,
        enum: ["location", "vente"],
        default: "location"
    },
    deposit: { type: Number, default: 0 },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number, default: 0 },
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
        enum: ["pending", "active", "rented", "sold", "archived"],
        default: "pending"
    },
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProperty>("Properties", propertySchema);