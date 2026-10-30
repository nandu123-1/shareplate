import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../db/database';
import { generateToken, authenticateToken } from '../middleware/auth';
import { User, DonorProfile, RecipientProfile } from '../types';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must have at least 6 characters'),
  role: z.enum(['DONOR', 'RECIPIENT', 'ADMIN']),
  // Donor specific fields
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  phone: z.string().optional(),
  pickupAddress: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  foodSafetyAck: z.boolean().optional(),
  // Recipient specific fields
  organizationName: z.string().optional(),
  organizationType: z.string().optional(),
  description: z.string().optional(),
  capacityPortions: z.number().optional(),
  serviceArea: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email.toLowerCase());
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const userId = 'usr_' + crypto.randomUUID();
    const now = new Date().toISOString();

    const insertTx = db.transaction(() => {
      // 1. Insert user
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
      `).run(userId, data.name, data.email.toLowerCase(), passwordHash, data.role, now, now);

      // 2. Insert role profile
      if (data.role === 'DONOR') {
        const profileId = 'dp_' + crypto.randomUUID();
        db.prepare(`
          INSERT INTO donor_profiles (
            id, user_id, business_name, business_type, phone,
            pickup_address, city, postal_code, food_safety_ack, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          profileId,
          userId,
          data.businessName || data.name,
          data.businessType || 'Restaurant',
          data.phone || '555-0199',
          data.pickupAddress || '100 Market St',
          data.city || 'Metro City',
          data.postalCode || '90210',
          data.foodSafetyAck ? 1 : 1,
          now
        );
      } else if (data.role === 'RECIPIENT') {
        const profileId = 'rp_' + crypto.randomUUID();
        db.prepare(`
          INSERT INTO recipient_profiles (
            id, user_id, organization_name, organization_type, description,
            phone, address, city, capacity_portions_per_day, verification_status,
            service_area, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED', ?, ?)
        `).run(
          profileId,
          userId,
          data.organizationName || data.name,
          data.organizationType || 'Food Bank',
          data.description || 'Community food assistance',
          data.phone || '555-0188',
          data.pickupAddress || '250 Unity Ave',
          data.city || 'Metro City',
          data.capacityPortions || 150,
          data.serviceArea || 'Metro City Central',
          now
        );
      }
    });

    insertTx();

    const userRecord = db.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').get(userId) as User;
    const token = generateToken(userRecord);

    let profile: any = null;
    if (userRecord.role === 'DONOR') {
      profile = db.prepare('SELECT * FROM donor_profiles WHERE user_id = ?').get(userId);
    } else if (userRecord.role === 'RECIPIENT') {
      profile = db.prepare('SELECT * FROM recipient_profiles WHERE user_id = ?').get(userId);
    }

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: userRecord,
      profile
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email.toLowerCase()) as User | undefined;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Account has been suspended. Please contact platform administrators.' });
      return;
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);

    let profile: any = null;
    if (user.role === 'DONOR') {
      profile = db.prepare('SELECT * FROM donor_profiles WHERE user_id = ?').get(user.id);
    } else if (user.role === 'RECIPIENT') {
      profile = db.prepare('SELECT * FROM recipient_profiles WHERE user_id = ?').get(user.id);
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      profile
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Invalid input' });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user and profile
authRouter.get('/me', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = db.prepare('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?').get(userId) as User | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let profile: any = null;
  if (user.role === 'DONOR') {
    profile = db.prepare('SELECT * FROM donor_profiles WHERE user_id = ?').get(userId);
  } else if (user.role === 'RECIPIENT') {
    profile = db.prepare('SELECT * FROM recipient_profiles WHERE user_id = ?').get(userId);
  }

  res.json({ user, profile });
});

// Update profile
authRouter.put('/profile', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  try {
    const { name, phone, address, city, businessType, description, capacityPortions, serviceArea } = req.body;

    if (name) {
      db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').run(name, new Date().toISOString(), userId);
    }

    if (role === 'DONOR') {
      db.prepare(`
        UPDATE donor_profiles 
        SET business_name = COALESCE(?, business_name),
            business_type = COALESCE(?, business_type),
            phone = COALESCE(?, phone),
            pickup_address = COALESCE(?, pickup_address),
            city = COALESCE(?, city)
        WHERE user_id = ?
      `).run(name, businessType, phone, address, city, userId);
    } else if (role === 'RECIPIENT') {
      db.prepare(`
        UPDATE recipient_profiles
        SET organization_name = COALESCE(?, organization_name),
            description = COALESCE(?, description),
            phone = COALESCE(?, phone),
            address = COALESCE(?, address),
            city = COALESCE(?, city),
            capacity_portions_per_day = COALESCE(?, capacity_portions_per_day),
            service_area = COALESCE(?, service_area)
        WHERE user_id = ?
      `).run(name, description, phone, address, city, capacityPortions, serviceArea, userId);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
