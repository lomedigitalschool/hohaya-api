import { privateDecrypt } from 'crypto';
import { NOTFOUND } from 'dns';
import { Request, Response } from 'express';
import Properties from '../models/Properties';
import { title } from 'process';
import { escape } from 'querystring';
import { uploadPicture } from './users.controller';

export async function createProperty(req: Request, res: Response) {
    try {
        const{ ownerId, title, price, location, description, type } = req.body;
        //
        const property = await Properties.create(ownerId);

        if (!property) {
            return res.status(400).json ({ message: "no acces to property"});
        }
        const properties = await Properties.create({
            ownerId,
            title,
            price,
            location,
            description,
            type
        });
         return res.status(201).json({ success: true, message: "Property created" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}


export async function getAllProperties(req: Request, res: Response) {
    try {
        const properties = await Properties.find({
        title,
        location
        });
        return res.status(200).json({ success: true, properties: [] });
    } catch (error: any) {
        res.status(500).json({ message: error.message })
    }
}



export async function getPropertyDetails(req: Request, res: Response) {
    try {
        const { propertiesId } =req.params;

        const properties = await Properties.findById();
        if(!properties) {
            return res.status(400).json({ succes: false, message: "properties no acces"});
        }
    return res.status(200).json({ success: true, property: {} });
    } catch (error: any) {
        res.status(500).json({ message: NOTFOUND })
    }
}



export async function updateProperty(req: Request, res: Response) {
    try {
        const { propertiesId } = req.params;
        let properties = await Properties.findById();

            if (!properties) {
                return res.status(404).json({ succes: false, msg: "Properties empty"});
            }


        properties = await Properties.findByIdAndUpdate(
            propertiesId,
            req.body {
                new: true,
                runValidators: true
            }
        );

    return res.status(200).json({ success: true, message: "Property updated" });

    } catch (error: any) {
        res.status(500).json({ message: error});
    }
}



export async function deleteProperty(req: Request, res: Response) {
    try {
        const { propertiesId } = req.params;

        const properties = await Properties.findById(propertiesId);
            if (!properties) {
                return res.status(404).json({ succes: false, msg: "properties not found"});
            }
        await Properties.findByIdAndDelete(properties);
        return res.status(200).json({ success: true, message: "Property deleted" });

    } catch (error: any) {
        res.status(500).json({ message: error});
    }
}



export async function uploadPropertyImages(req: Request, res: Response) {
    try {
        const { propertiesId } = req.body;
       
        const properties = await Properties.findById(propertiesId);
      if (!properties) {
            return res.status(400).json({ msg: "Properties not found"});
      } 
      properties.images = properties.images.contact();
      await properties.save();
    return res.status(200).json({ success: true, message: "Images uploaded" });
   
    } catch (error: any) {
        res.status(500).json({ message: error});
    }    
}



export async function getMyProperties(req: Request, res: Response) {
    try {
        const usersId = req.users.id;
        const properties = await Properties.findOne({ users: usersId });

    return res.status(200).json({ success: true, properties: [] });

    } catch (error: any) {
        res.status(500).json({ message: "error"});
    }
}


export async function getOwnerProperties(req: Request, res: Response) {
    try {
        const usersId = req.users.id;

        const properties = await Properties.find({ owner: usersId });

    return res.status(200).json({ success: true, properties: [] });
    } catch (error) {
        res.status(500).json({ message: error })
    }
}    


export async function updatePropertyStatus(req: Request, res: Response) {
    try {
        const { propertiesId } = req.params;
        const { status } = req.body;

        const properties = await Properties.findById(propertiesId);
            if (!properties) {
                return res.status(403).json({ message: "Properties not found"});
                } properties.status = status;
                    await properties.save();
                return res.status(200).json({ succes: true, msg: "Status updated "});

    } catch (error) {
        res.status(500).json({ message: error});
    }
        
}