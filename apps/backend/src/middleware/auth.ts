import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Unauthorized } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    user_type: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new Unauthorized('Missing authorization token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as any;
    next();
  } catch (err) {
    throw new Unauthorized('Invalid or expired token');
  }
}

export function generateToken(user: { id: string; email: string; user_type: string }) {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '24h' });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}
