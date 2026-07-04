import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "testifaith-fallback-secret";

export type UnsubscribeType = "newsletter" | "declaration";

export function generateUnsubscribeToken(userId: string, type: UnsubscribeType): string {
  return crypto.createHmac("sha256", SECRET).update(`${userId}:${type}`).digest("hex");
}

export function verifyUnsubscribeToken(userId: string, type: UnsubscribeType, token: string): boolean {
  const expected = generateUnsubscribeToken(userId, type);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(userId: string, type: UnsubscribeType): string {
  const baseUrl = process.env.NODE_ENV === "production"
    ? "https://testifaith.com"
    : `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost"}`;
  const token = generateUnsubscribeToken(userId, type);
  return `${baseUrl}/api/unsubscribe?uid=${userId}&type=${type}&token=${token}`;
}
