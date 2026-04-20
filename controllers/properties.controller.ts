import { Request, Response } from 'express';
import Properties from "../models/Properties";

// Create a Property
export async function createProperties(req: Request, res: Response) {
    try {
        const property = await Properties.create(req.body);
        res.json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

// Find a Property
export async function findProperties(req: Request, res: Response) {
    try {
        const properties = await Properties.find()
            .populate("ownerId", "firstName lastName email");

        res.json(properties);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

// Stats : number of properties per location
export async function propertiesStats(req: Request, res: Response) {
    try {
        const stats = await Properties.aggregate([
            {
                $group: {
                    _id: "$location",
                    avgPrice: { $avg: "$price" },
                    totalProperties: { $sum: 1 }
                }
            }
        ]);
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}