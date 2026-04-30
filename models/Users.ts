import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    role: 'tenant' | 'owner' | 'admin';
    isVerified: boolean;
    location: {
        city: string;
        district?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    refreshToken: string;
    profilePicture?: string;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['tenant', 'owner', 'admin'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    location: {
        city: {
            type: String,
            required: true
        },
        district: {
            type: String
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    profilePicture: {
        type: String // URL
    },
    refreshToken: { 
        type: String 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre<IUser>("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.comparePassword = function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('Users', userSchema);