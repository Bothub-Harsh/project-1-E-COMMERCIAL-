import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, 'customer', $4)
      RETURNING id, name, email, role, phone, created_at;
    `, [name.trim(), normalizedEmail, passwordHash, phone || null]);

    const user = result.rows[0];
    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await query(
      'SELECT id, name, email, password_hash, role, phone, created_at FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      created_at: user.created_at
    };

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user: safeUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

export const getCurrentUser = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty.'
      });
    }

    const result = await query(`
      UPDATE users
      SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, role, phone, created_at, updated_at;
    `, [name.trim(), phone || null, userId]);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
