import { privateDecrypt } from 'crypto';
import { NOTFOUND } from 'dns';
import { Request, Response } from 'express';
import Properties from '../models/Properties';
import { title } from 'process';
import { escape } from 'querystring';
import { uploadPicture } from './users.controller';

export async function createProperty(req: Request, res: Response) {
    try {
        const{ ownerId, title, price, location } = req.body;
        //
        const property = await Properties.create(ownerId);

        if (!property) {
            return res.status(400).json ({ message: "no acces to property"});
        }
        const properties = await Properties.create({
            ownerId,
            title,
            price,
            location
        });
         return res.status(201).json({ success: true, message: "Property created" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}


export async function getAllProperties(req: Request, res: Response) {
    try {
        const properties = await Properties.findById({
        title,
        location
        });
        return res.status(200).json({ success: true, properties: [] });
    } catch (error: any) {
        res.status(501).json({ message: NOTFOUND })
    }
}



export async function getPropertyDetails(req: Request, res: Response) {
    try {
        const properties = await Properties.findById();
    return res.status(200).json({ success: true, property: {} });
    } catch (error: any) {
        res.status(500).json({ message: NOTFOUND })
    }
}




export async function updateProperty(req: Request, res: Response) {
    try {
        const properties = await Properties.findByIdAndUpdate({
            title,
            location,
            Location
         });
    return res.status(200).json({ success: true, message: "Property updated" });
    } catch (error: any) {
        res.status(500).json({ message: error})
    }
}



export async function deleteProperty(req: Request, res: Response) {
    try {
        const properties = await Properties.deleteOne({
            title
    
        });
    return res.status(200).json({ success: true, message: "Property deleted" });
    } catch (error: any) {
        res.status(500).json({ message: error})
    }
}



export async function uploadPropertyImages(req: Request, res: Response) {
    try {
        const properties = await Properties.find();
    return res.status(200).json({ success: true, message: "Images uploaded" });
    } catch (error: any) {
        res.status(500).json({ message: error})
    }    
}



export async function getMyProperties(req: Request, res: Response) {
    try {
        const properties = await Properties.findOne({
            title,
            uploadPicture,
        });
    return res.status(200).json({ success: true, properties: [] });
    } catch (error: any) {
        res.status(500).json({ message: "error"})
    }
}



export async function getOwnerProperties(req: Request, res: Response) {
    return res.status(200).json({ success: true, properties: [] });
}

export async function updatePropertyStatus(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: "Status updated" });
}