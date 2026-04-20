import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import { findUsers, createUsers, userProfile } from '../controllers/users.controller';

const router = Router();

// Find Users route
router.get('/', findUsers);

// Create User route
router.post('/create', createUsers);

// User Profile 
router.get('/profile', authMiddleware, roleMiddleware('owner'), userProfile);

export default router;