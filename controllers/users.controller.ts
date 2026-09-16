import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Users from '../models/Users';
import Properties from '../models/Properties';
import { toClientJson as propertyToClientJson } from './properties.controller';

// hohoya-mobile's UserProfile.fromJson expects a flat object with a single
// `name`, directly as the response body (not wrapped in {success, user}).
// `includeContact` strips email/phone for a profile viewed by someone else.
function toClientJson(user: any, { includeContact }: { includeContact: boolean }) {
    return {
        id: user._id,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        email: includeContact ? user.email ?? '' : '',
        phone: includeContact ? user.phoneNumber ?? '' : '',
        role: user.role,
        pictureUrl: user.profilePicture ?? null,
    };
}

// Récupérer son propre profil complet
export async function getMe(req: AuthRequest, res: Response) {
    try {
        const user = await Users.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(toClientJson(user, { includeContact: true }));
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Récupérer le profil public d'un autre utilisateur, avec ses annonces
// actives si c'est un propriétaire (PropertyService.fetchUser sur mobile
// s'appuie sur cette même route pour construire une page "agence").
export async function getUserById(req: Request, res: Response) {
    try {
        const user = await Users.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = toClientJson(user, { includeContact: false });
        if (user.role === 'owner') {
            const properties = await Properties.find({ ownerId: user._id, status: { $ne: 'archived' } });
            return res.status(200).json({ ...profile, properties: properties.map(propertyToClientJson) });
        }
        return res.status(200).json(profile);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Mettre à jour ses informations personnelles
export async function updateMe(req: AuthRequest, res: Response) {
    try {
        const user = await Users.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { firstName, lastName, phoneNumber } = req.body;
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        await user.save();

        return res.status(200).json(toClientJson(user, { includeContact: true }));
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Changer son mot de passe
export async function changePassword(req: AuthRequest, res: Response) {
    try {
        const user = await Users.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { currentPassword, newPassword } = req.body;
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
        }

        user.password = newPassword; // re-hashed by the pre('save') hook
        await user.save();

        return res.status(200).json({ success: true, message: 'Password changed' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Uploader une photo de profil (URL déjà hébergée — pas d'upload binaire ici)
export async function uploadPicture(req: AuthRequest, res: Response) {
    try {
        const user = await Users.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { pictureUrl } = req.body;
        user.profilePicture = pictureUrl;
        await user.save();

        return res.status(200).json(toClientJson(user, { includeContact: true }));
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Lister ses propriétés mises en favoris — réponse en tableau brut
// (PropertyService.fetchFavorites sur mobile fait `response.data as List`).
export async function getFavorites(req: AuthRequest, res: Response) {
    try {
        const user = await Users.findById(req.user.userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json((user.favorites as any[]).map(propertyToClientJson));
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Ajouter une annonce aux favoris
export async function addFavorite(req: AuthRequest, res: Response) {
    try {
        const user = await Users.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const propertyId = req.params.propertyId;
        if (!user.favorites.some((id) => id.toString() === propertyId)) {
            user.favorites.push(propertyId as any);
            await user.save();
        }
        return res.status(200).json({ success: true, message: 'Added to favorites' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Retirer une annonce des favoris
export async function removeFavorite(req: AuthRequest, res: Response) {
    try {
        const user = await Users.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.favorites = user.favorites.filter((id) => id.toString() !== req.params.propertyId) as any;
        await user.save();
        return res.status(200).json({ success: true, message: 'Removed from favorites' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
