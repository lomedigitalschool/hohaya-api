import { Router } from 'express';
import { login, register, refresh, logout, googleAuth } from '../controllers/auth.controller';

const router = Router();

// User login & Token Generate
router.post('/login', login);

// User register
router.post('/register', register);

// Token Refreshing
router.post('/refresh', refresh);

// Token broker
router.post('/logout', logout);

// Google Sign-In — controller currently returns 501 (not implemented yet:
// needs google-auth-library + a confirmed OAuth client id to verify the
// idToken against). Mounting the route at least turns a 404 into an
// honest "not implemented" for clients that call it.
router.post('/google', googleAuth);





export default router;