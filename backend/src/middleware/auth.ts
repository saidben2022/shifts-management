import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { AuthRequest } from '../types/express';

interface JwtPayload {
  userId: number;
  isAdmin: boolean;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ message: 'Invalid token format' });
      return;
    }

    const token = parts[1];
    
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload;

    // Get user from database to ensure they still exist
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      isAdmin: decoded.isAdmin
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(401).json({ message: 'Authentication failed' });
    }
  }
};

export const adminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Admin access required' });
  }
};
