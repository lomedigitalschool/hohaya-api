import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';

const router = Router();

// User login
router.post('/login', login);

// User register
router.post('/register', register);

export default router;
