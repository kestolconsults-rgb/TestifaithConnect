import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { RequestHandler, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const isAdminAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && (req.session as any).adminId) {
    return next();
  }
  return res.status(401).json({ message: "Admin authentication required" });
};

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

export function checkLoginRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; lockoutEnds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  
  if (!record) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }
  
  if (now - record.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }
  
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      lockoutEnds: record.lastAttempt + LOCKOUT_DURATION 
    };
  }
  
  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - record.count };
}

export function recordLoginAttempt(ip: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(ip);
    return;
  }
  
  const record = loginAttempts.get(ip);
  const now = Date.now();
  
  if (!record) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  } else {
    loginAttempts.set(ip, { count: record.count + 1, lastAttempt: now });
  }
}

export function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    const oldSession = req.session as any;
    const adminId = oldSession.adminId;
    const adminUsername = oldSession.adminUsername;
    
    req.session.regenerate((err) => {
      if (err) {
        reject(err);
        return;
      }
      (req.session as any).adminId = adminId;
      (req.session as any).adminUsername = adminUsername;
      resolve();
    });
  });
}

export function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export async function createInitialAdmin(): Promise<void> {
  const existingAdmin = await storage.getAdminByUsername("admin");
  if (!existingAdmin) {
    // Never fall back to a hardcoded/predictable password. If ADMIN_PASSWORD
    // isn't set, generate a strong random one-time password and print it once
    // so it can be captured and changed immediately after first login.
    const generatedPassword = crypto.randomBytes(18).toString("base64url");
    const initialPassword = process.env.ADMIN_PASSWORD || generatedPassword;
    const passwordHash = await hashPassword(initialPassword);
    await storage.createAdmin({
      username: "admin",
      passwordHash,
      displayName: "Testifaith Admin",
    });
    if (process.env.ADMIN_PASSWORD) {
      console.log("Initial admin account created. Username: admin (password from ADMIN_PASSWORD env var)");
    } else {
      console.log("=================================================================");
      console.log("Initial admin account created. Username: admin");
      console.log(`Temporary password: ${initialPassword}`);
      console.log("This password was randomly generated and will NOT be shown again.");
      console.log("Log in now and change it, or set an ADMIN_PASSWORD env var before your next deploy.");
      console.log("=================================================================");
    }
  }
}
