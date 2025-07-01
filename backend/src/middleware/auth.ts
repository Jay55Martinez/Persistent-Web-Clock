// backend/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // First try to get token from cookies
  let token = req.cookies?.token;
  
  // If no cookie token, fall back to Authorization header (for backward compatibility)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
