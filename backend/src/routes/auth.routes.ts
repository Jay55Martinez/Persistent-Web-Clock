import express from 'express';
import * as auth from '../controllers/auth.controller';
import { authenticateUser, refreshToken } from '../middleware/auth';

const router = express.Router();

router.post('/signup', auth.signup as express.RequestHandler);
router.post('/verify', auth.verifyAccount as express.RequestHandler);
router.post('/resend-verify', auth.verifyResend as express.RequestHandler);
router.post('/login', auth.login as express.RequestHandler);
router.post('/logout', auth.logout as express.RequestHandler);
router.post('/request-password-reset', auth.requestPasswordReset as express.RequestHandler);
router.post('/verify-reset-code', auth.verifyResetCode as express.RequestHandler);
router.post('/reset-password', auth.resetPassword as express.RequestHandler);
router.post('/refresh', refreshToken as express.RequestHandler);
router.post('/google-oauth-login', auth.googleOAuthLogin as express.RequestHandler);
router.get('/me', authenticateUser as any, auth.verifyAuth as express.RequestHandler);

export default router;