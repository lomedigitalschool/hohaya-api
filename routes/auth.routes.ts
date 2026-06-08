import { Router } from 'express';
import { login, register ,refresh , logout, googleAuth } from '../controllers/auth.controller';

const router = Router();

// User login & Token Generate
router.post('/login', login);

// User register
router.post('/register', register);

// Token Refreshing
router.post('/refresh', refresh);

// Token broker
router.post('/logout', logout);

// OAuth
router.post("/google", googleAuth);





export default router;