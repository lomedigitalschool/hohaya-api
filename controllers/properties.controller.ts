import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Properties from '../models/Properties';

// hohoya-mobile's Property.fromJson (and the create/search UI) speak French
// type/status labels; this schema's enums are English. Translate at the
// boundary so neither side has to change its own vocabulary.
const TYPE_TO_API: Record<string, string> = {
    Appartement: 'apartment',
    Maison: 'house',
    Villa: 'villa',
    Terrain: 'land',
    Bureau: 'office',
    Commerce: 'commercial',
    Studio: 'studio',
};
const TYPE_FROM_API: Record<string, string> = Object.fromEntries(
    Object.entries(TYPE_TO_API).map(([fr, en]) => [en, fr]),
);

const STATUS_TO_API: Record<string, string> = {
    pending: 'pending',
    active: 'active',
    'loué': 'rented',
    vendu: 'sold',
    'archivé': 'archived',
};
const STATUS_FROM_API: Record<string, string> = Object.fromEntries(
    Object.entries(STATUS_TO_API).map(([fr, en]) => [en, fr]),
);

// Mirrors PropertyService.updateStatus on the mobile side, so both agree on
// which status changes are legal.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    pending: ['pending', 'archived'],
    active: ['active', 'rented', 'sold', 'archived'],
    rented: ['rented', 'active', 'sold', 'archived'],
    sold: ['sold', 'archived'],
    archived: ['archived', 'active'],
};

export function toClientJson(property: any) {
    const owner = property.ownerId;
    return {
        id: property._id,
        title: property.title,
        city: property.location?.city ?? '',
        neighborhood: property.location?.district ?? '',
        address: property.location?.address ?? '',
        type: TYPE_FROM_API[property.type] ?? property.type,
        price: property.price,
        priceType: property.priceType ?? 'location',
        deposit: property.deposit ?? 0,
        bedrooms: property.bedrooms ?? 0,
        bathrooms: property.bathrooms ?? 0,
        area: property.area ?? 0,
        description: property.description ?? '',
        status: STATUS_FROM_API[property.status] ?? property.status,
        images: property.images ?? [],
        imageUrl: property.images?.[0] ?? '',
        ownerId: owner?._id ?? owner ?? '',
        ownerName: owner && owner.firstName ? `${owner.firstName} ${owner.lastName ?? ''}`.trim() : 'Propriétaire',
        createdAt: property.createdAt ? new Date(property.createdAt).toISOString() : new Date().toISOString(),
    };
}

// CREER UNE NOUVELLE ANNONCE IMMOBILIERE
export async function createProperty(req: AuthRequest, res: Response) {
    try {
        const { title, description, type, price, priceType, deposit, bedrooms, bathrooms, area, city, neighborhood, address, images } = req.body;

        const property = await Properties.create({
            ownerId: req.user.userId,
            title,
            description,
            type: (TYPE_TO_API[type] ?? type) as any,
            price,
            priceType,
            deposit,
            bedrooms,
            bathrooms,
            area,
            location: { city, district: neighborhood, address },
            images: images ?? [],
            status: 'pending',
        });

        await property.populate('ownerId', 'firstName lastName');
        return res.status(201).json(toClientJson(property));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// LISTER TOUTES LES ANNONCES (public — uniquement les biens actifs)
export async function getAllProperties(req: Request, res: Response) {
    try {
        const { search, city, neighborhood, type, minPrice, maxPrice, page = '1', pageSize = '10' } = req.query as Record<string, string>;

        const filter: Record<string, any> = { status: 'active' };
        if (search) filter.title = { $regex: search, $options: 'i' };
        if (city) filter['location.city'] = { $regex: city, $options: 'i' };
        if (neighborhood) filter['location.district'] = neighborhood;
        if (type && type !== 'Tous') filter.type = TYPE_TO_API[type] ?? type;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const pageNum = Math.max(1, Number(page) || 1);
        const size = Math.max(1, Number(pageSize) || 10);

        const properties = await Properties.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * size)
            .limit(size)
            .populate('ownerId', 'firstName lastName');

        return res.status(200).json({ success: true, properties: properties.map(toClientJson) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// VOIR LES DETAILS COMPLETS D'UNE ANNONCE
export async function getPropertyDetails(req: Request, res: Response) {
    try {
        const property = await Properties.findById(req.params.propertyId).populate('ownerId', 'firstName lastName');
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        return res.status(200).json({ success: true, property: toClientJson(property) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// MODIFIER UNE ANNONCE EXISTANTE (proprietaire uniquement)
export async function updateProperty(req: AuthRequest, res: Response) {
    try {
        const property = await Properties.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { title, description, type, price, bedrooms, bathrooms, area, city, neighborhood, address } = req.body;
        if (title !== undefined) property.title = title;
        if (description !== undefined) property.description = description;
        if (type !== undefined) property.type = (TYPE_TO_API[type] ?? type) as any;
        if (price !== undefined) property.price = price;
        if (bedrooms !== undefined) property.bedrooms = bedrooms;
        if (bathrooms !== undefined) property.bathrooms = bathrooms;
        if (area !== undefined) property.area = area;
        if (city !== undefined) property.location.city = city;
        if (neighborhood !== undefined) property.location.district = neighborhood;
        if (address !== undefined) property.location.address = address;

        await property.save();
        await property.populate('ownerId', 'firstName lastName');
        return res.status(200).json({ success: true, message: 'Property updated', property: toClientJson(property) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// SUPPRIMER UNE ANNONCE (proprietaire uniquement)
export async function deleteProperty(req: AuthRequest, res: Response) {
    try {
        const property = await Properties.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await property.deleteOne();
        return res.status(200).json({ success: true, message: 'Property deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// UPLOADER UNE GALERIE DE PHOTOS POUR UN BIEN (proprietaire uniquement)
// Prend une liste d'URLs déjà hébergées — pas d'upload de fichier binaire ici.
export async function uploadPropertyImages(req: AuthRequest, res: Response) {
    try {
        const property = await Properties.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { images } = req.body as { images: string[] };
        property.images = [...(property.images ?? []), ...(images ?? [])];
        await property.save();

        await property.populate('ownerId', 'firstName lastName');
        return res.status(200).json({ success: true, message: 'Images uploaded', property: toClientJson(property) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// LISTER LES ANNONCES DU PROPRIETAIRE CONNECTE (tous statuts)
export async function getMyProperties(req: AuthRequest, res: Response) {
    try {
        const properties = await Properties.find({ ownerId: req.user.userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, properties: properties.map(toClientJson) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// LISTER LES ANNONCES PUBLIQUES D'UN PROPRIETAIRE SPECIFIQUE
export async function getOwnerProperties(req: Request, res: Response) {
    try {
        const properties = await Properties.find({
            ownerId: req.params.ownerId,
            status: { $ne: 'archived' },
        }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, properties: properties.map(toClientJson) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// CHANGER LE STATUT DU BIEN (proprietaire uniquement)
export async function updatePropertyStatus(req: AuthRequest, res: Response) {
    try {
        const property = await Properties.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const requested = STATUS_TO_API[req.body.status] ?? req.body.status;
        if (!ALLOWED_TRANSITIONS[property.status]?.includes(requested)) {
            return res.status(400).json({ message: `Cannot transition from ${property.status} to ${requested}` });
        }

        property.status = requested as any;
        await property.save();
        await property.populate('ownerId', 'firstName lastName');
        return res.status(200).json({ success: true, message: 'Status updated', property: toClientJson(property) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
