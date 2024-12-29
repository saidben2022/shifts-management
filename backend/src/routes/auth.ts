import express from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth';
import { AuthRequest } from '../types/express';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userRepository.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Verify token
router.get('/verify', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.json({ valid: false });
    }

    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    if (!user) {
      return res.json({ valid: false });
    }

    res.json({ 
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.json({ valid: false });
  }
});

export { router as authRoutes };