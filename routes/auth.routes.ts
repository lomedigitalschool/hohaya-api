import { Router } from 'express';
import { login, register ,refresh , logout } from '../controllers/auth.controller';

const router = Router();

// User login & Token Generate
router.post('/auth/login', login);

// User register
router.post('/auth/register', register);

// Token Refreshing
router.post('auth/refresh', refresh);

// Token broker
router.post('auth/logout', logout);



export default router;