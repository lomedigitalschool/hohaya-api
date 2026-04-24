import { Router } from 'express';
import auth from '../middlewares/authMiddleware';
import {
  getMe,
  getUserById,
  updateMe,
  changePassword,
  uploadPicture,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/users.controller';

const router = Router();

//Récupérer son propre profil complet
router.get("/me", auth, getMe);

//Mettre à jour ses informations personnelles
router.put("/me", auth, updateMe);

// Changer son mot de passe
router.put("/me/password", auth, changePassword);

// Uploader une photo de profil
router.post("/me/picture", auth, uploadPicture);

// Ajouter une annonce aux favoris
router.post("/me/favorites/:propertyId", auth, addFavorite);

//lister ses propriétés mises en favoris
router.get("/me/favorites", auth, getFavorites);

// Retirer une annonce des favoris
router.delete("/me/favorites/:propertyId", auth, removeFavorite);

//Récupérer le profil public d'un autre utilisateur
router.get("/:userId", getUserById);

export default router;