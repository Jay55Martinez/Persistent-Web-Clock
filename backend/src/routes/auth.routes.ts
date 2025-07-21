import express from 'express';
import { login, signup, logout, verifyAuth, verifyAccount, verifyResend } from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

router.post('/signup', signup as express.RequestHandler);
router.post('/verify-signup', verifyAccount as express.RequestHandler);
router.post('/resend-verify', verifyResend as express.RequestHandler);
router.post('/login', login as express.RequestHandler);
router.post('/logout', logout as express.RequestHandler);
router.get('/verify', authenticateUser as any, verifyAuth as express.RequestHandler);

export default router;