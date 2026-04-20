import { Request, Response } from 'express';
import Users from '../models/Users';
import jwt from 'jsonwebtoken';

// login and Token Generating
export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const user: any = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            "SECRET_KEY", // Should use environment variable in production
            { expiresIn: "3h" }
        );
        res.json({ token });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

// User register
export async function register(req: Request, res: Response) {
    try {
        const user = await Users.create(req.body);
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
