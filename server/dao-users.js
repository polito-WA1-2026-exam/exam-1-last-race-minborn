import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { dbGet } from "./db.js";

const scryptAsync = promisify(scrypt);

export function getUserByUsername(username) {
  return dbGet("SELECT * FROM users WHERE username = ?", [username]);
}

export function getUserById(id) {
  return dbGet("SELECT * FROM users WHERE id = ?", [id]);
}

export async function checkPassword(user, password) {
  if (!user || typeof password !== "string") {
    return false;
  }

  const storedHash = Buffer.from(user.hash, "hex");
  const computedHash = await scryptAsync(password, user.salt, storedHash.length);

  return timingSafeEqual(storedHash, computedHash);
}
