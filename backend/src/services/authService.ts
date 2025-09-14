import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { query } from "../config/database";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/authType";
import { StringValue } from "ms";

export class AuthService {
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const { firstName, lastName, email, password } = userData;

    // Check if user already exists
    const existingUser = await query(
      "SELECT user_id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (email, first_name, last_name, password_hash, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING user_id, email, first_name, last_name, created_at`,
      [email.toLowerCase().trim(), firstName.trim(), lastName.trim(), password_hash]
    );

    const user = result.rows[0];

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const payload = { userId: user.user_id, email: user.email };
    const secret: jwt.Secret = process.env.JWT_SECRET;
    const expiresIn: StringValue = (process.env.JWT_EXPIRES_IN || "7d") as StringValue;
    const options: SignOptions = { expiresIn };
    const token = jwt.sign(payload, secret, options);

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    };
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email (case insensitive)
    const result = await query(
      "SELECT user_id, email, first_name, last_name, password_hash FROM users WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    );

    if (result.rows.length === 0) {
      throw new Error("No account found with this email address");
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const payload = { userId: user.user_id, email: user.email };
    const secret: jwt.Secret = process.env.JWT_SECRET;
    const expiresIn: StringValue = (process.env.JWT_EXPIRES_IN || "7d") as StringValue;
    const options: SignOptions = { expiresIn };
    const token = jwt.sign(payload, secret, options);

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    };
  }

  static async getUserById(userId: number): Promise<User | null> {
    const result = await query(
      "SELECT user_id, email, first_name, last_name, created_at, updated_at FROM users WHERE user_id = $1",
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}