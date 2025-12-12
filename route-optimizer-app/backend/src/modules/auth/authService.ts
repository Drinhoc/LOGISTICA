import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errorHandler';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

const sanitizeUser = (user: { id: string; name: string; email: string }): AuthResult['user'] => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const ensureJwtConfig = () => {
  if (!env.JWT_SECRET) {
    throw new AppError('JWT secret not configured', 500);
  }
};

const generateToken = (userId: string) => {
  ensureJwtConfig();
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '1d',
  });
};

export class AuthService {
  static async register({ name, email, password }: RegisterInput): Promise<AuthResult> {
    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    return {
      user: sanitizeUser(user),
      token: generateToken(user.id),
    };
  }

  static async login({ email, password }: LoginInput): Promise<AuthResult> {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    return {
      user: sanitizeUser(user),
      token: generateToken(user.id),
    };
  }
}
