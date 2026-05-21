import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { pool } from '../../config/database';
import { BadRequest, Unauthorized } from '../../middleware/errorHandler';
import { generateToken, generateRefreshToken } from '../../middleware/auth';
import { User, UserType } from '../../types';

const router = Router();

interface RegisterRequest {
  email: string;
  password: string;
  phone: string;
  user_type: UserType;
  document_id?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, phone, user_type, document_id } = req.body as RegisterRequest;

    // Validation
    if (!email || !password || !phone || !user_type) {
      throw new BadRequest('Missing required fields');
    }

    if (password.length < 8) {
      throw new BadRequest('Password must be at least 8 characters');
    }

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR phone = $2', [email, phone]);
    if (existing.rows.length > 0) {
      throw new BadRequest('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const result = await pool.query(
      `INSERT INTO users (id, email, phone, document_id, user_type, kyc_status, reputation_score, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 5.0, 'active', NOW(), NOW())
       RETURNING id, email, phone, user_type, created_at`,
      [userId, email, phone, document_id || null, user_type, user_type === 'driver' ? 'pending' : 'verified']
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, email: user.email, user_type: user.user_type });
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      user,
      token,
      refresh_token: refreshToken,
    });
  } catch (err) {
    throw err;
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      throw new BadRequest('Email and password are required');
    }

    const result = await pool.query(
      'SELECT id, email, user_type, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Unauthorized('Invalid credentials');
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      throw new Unauthorized('Invalid credentials');
    }

    const token = generateToken({ id: user.id, email: user.email, user_type: user.user_type });
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: { id: user.id, email: user.email, user_type: user.user_type },
      token,
      refresh_token: refreshToken,
    });
  } catch (err) {
    throw err;
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new BadRequest('Refresh token required');
    }

    // Verify refresh token (simplified - should store in Redis)
    const userId = refresh_token.split('.')[0]; // Placeholder

    const result = await pool.query('SELECT id, email, user_type FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      throw new Unauthorized('Invalid refresh token');
    }

    const user = result.rows[0];
    const newToken = generateToken({ id: user.id, email: user.email, user_type: user.user_type });

    res.json({ token: newToken });
  } catch (err) {
    throw err;
  }
});

export default router;
