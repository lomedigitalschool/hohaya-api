import { Request, Response } from 'express';
import Users from '../models/Users';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function findUsers(req: Request, res: Response) {
    try {
        const users = await Users.find();
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function createUsers(req: Request, res: Response) {
    try {
        const user = await Users.create(req.body);
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function userProfile(req: AuthRequest, res: Response) {
    res.json({ user: req.user });
}
