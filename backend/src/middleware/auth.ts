// backend/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

const isProd = process.env.NODE_ENV === 'production';
const cookieOpts = {
  httpOnly: true as const,
  secure: isProd,
  // type for sameSite in cookie options can be 'lax' | 'strict' | 'none'
  sameSite: (isProd ? 'none' : 'lax') as any,
};

// todo: not sure if this needs to be access token or refresh token
// AuthN middleware: prefer HttpOnly cookie 'accessToken', fall back to Bearer token
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Issues a fresh access token (and rotates refresh token) using the HttpOnly 'refreshToken' cookie
export const refreshToken = async (req: Request, res: Response) => {
  const rt = req.cookies?.refreshToken;
  if (!rt) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(rt, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
    const user = await User.findOne({ _id: decoded.userId, RefreshToken: rt });
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    // Issue new access token
    const newAccessToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });

    // todo: have a remember me option later - 7 days
    // Rotate refresh token
    const newRefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '1h' });
    user.RefreshToken = newRefreshToken;
    await user.save();

    res
      .cookie('accessToken', newAccessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', newRefreshToken, { ...cookieOpts, maxAge: 60 * 60 * 1000 })
      .json({ ok: true });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};
