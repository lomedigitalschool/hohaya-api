import { Router } from 'express';
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

// CREER UNE NOUVELLE ANNONCE IMMOBILIERE
router.post('/', createProperty);

// LISTER TOUTES LES ANNONCES
router.get('/', getAllProperties);

// LISTER LES ANNONCES DU PROPRIETAIRE CONNECTE
router.get('/owner/me', getMyProperties);

// LISTER LES ANNONCES PUBLIQUES D'UN PROPRIETAIRE SPECIFIQUE
router.get('/owner/:ownerId', getOwnerProperties);

// VOIR LES DETAILS COMPLETS D'UNE ANNONCE
router.get('/:propertyId', getPropertyDetails);

// MODIFIER UNE ANNONCE EXISTANTE
router.put('/:propertyId', updateProperty);

// SUPRIMER UNE ANNONCE(PROPRIETAIRE UNIQUEMENT)
router.delete('/:propertyId', deleteProperty);

// UPLOADER UNE GALERIE DE PHOTOS POUR UN BIEN
router.post('/:propertyId/images', uploadPropertyImages);

// CHANGER LE STATUT DU BIEN(ACTIF, LOUE, VENDU, ARCHIVE)
router.patch('/:propertiyId/status', updatePropertyStatus);

export default router;