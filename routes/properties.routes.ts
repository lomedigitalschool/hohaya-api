import { Router } from 'express';
const router = Router();


// CREER UNE NOUVELLE ANNONCE IMMOBILIERE
router.post('/create/properties');

// LISTER TOUTES LES ANNONCES
router.get('/properties')

// VOIR LES DETAILS COMPLETS D'UNE ANNONCE
router.get('/properties/:propertyId')

// MODIFIER UNE ANNONCE EXISTANTE
router.put('/properties/:propertyId')

// SUPRIMER UNE ANNONCE(PROPRIETAIRE UNIQUEMENT)
router.delete('/properties/:propertyId')

// UPLOADER UNE GALERIE DE PHOTOS POUR UN BIEN
router.post('/properties/:propertyId/images')

//LISTER LES ANNONCES DU PROPRIETAIRE CONNECTE
router.get('/properties/owner/me')

// LISTER LES ANNONCES PUBLIQUES D'UN PROPRIETAIRE SPECIFIQUE
router.get('/properties/owner/:ownerId')

// CHANGER LE STATUT DU BIEN(ACTIF, LOUE, VENDU, ARCHIVE)
router.patch('/properties/:propertiyId/status')