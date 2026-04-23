import { Request, Response } from 'express';

export async function createProperty(req: Request, res: Response) {
    return res.status(201).json({ success: true, message: "Property created" });
}

export async function getAllProperties(req: Request, res: Response) {
    return res.status(200).json({ success: true, properties: [] });
}

export async function getPropertyDetails(req: Request, res: Response) {
    return res.status(200).json({ success: true, property: {} });
}

export async function updateProperty(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: "Property updated" });
}

export async function deleteProperty(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: "Property deleted" });
}

export async function uploadPropertyImages(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: "Images uploaded" });
}

export async function getMyProperties(req: Request, res: Response) {
    return res.status(200).json({ success: true, properties: [] });
}

export async function getOwnerProperties(req: Request, res: Response) {
    return res.status(200).json({ success: true, properties: [] });
}

export async function updatePropertyStatus(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: "Status updated" });
}