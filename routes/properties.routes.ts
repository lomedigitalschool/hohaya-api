import { Router } from 'express';
import auth from '../middlewares/authMiddleware';
import {
    createProperty,
    getAllProperties,
    getPropertyDetails,
    updateProperty,
    deleteProperty,
    uploadPropertyImages,
    getMyProperties,
    getOwnerProperties,
    updatePropertyStatus
} from '../controllers/properties.controller';

const router = Router();

// CREER UNE NOUVELLE ANNONCE IMMOBILIERE (proprietaire connecte)
router.post('/', auth, createProperty);

// LISTER TOUTES LES ANNONCES (public)
router.get('/', getAllProperties);

// LISTER LES ANNONCES DU PROPRIETAIRE CONNECTE
router.get('/owner/me', auth, getMyProperties);

// LISTER LES ANNONCES PUBLIQUES D'UN PROPRIETAIRE SPECIFIQUE
router.get('/owner/:ownerId', getOwnerProperties);

// VOIR LES DETAILS COMPLETS D'UNE ANNONCE (public)
router.get('/:propertyId', getPropertyDetails);

// MODIFIER UNE ANNONCE EXISTANTE (proprietaire uniquement)
router.put('/:propertyId', auth, updateProperty);

// SUPRIMER UNE ANNONCE(PROPRIETAIRE UNIQUEMENT)
router.delete('/:propertyId', auth, deleteProperty);

// UPLOADER UNE GALERIE DE PHOTOS POUR UN BIEN (proprietaire uniquement)
router.post('/:propertyId/images', auth, uploadPropertyImages);

// CHANGER LE STATUT DU BIEN(ACTIF, LOUE, VENDU, ARCHIVE) (proprietaire uniquement)
router.patch('/:propertyId/status', auth, updatePropertyStatus);

export default router;