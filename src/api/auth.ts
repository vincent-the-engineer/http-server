import * as argon2 from "argon2";
import type { Request } from "express";
import jwt from "jsonwebtoken";


type Payload = Pick<jwt.JwtPayload, "iss" | "sub" | "iat" | "exp">;


export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  const valid = await argon2.verify(hash, password);

  return valid;
}

export async function hashPassword(password: string): Promise<string> {
  const hash = await argon2.hash(password);

  return hash;
}

export async function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    iss: "chirpy",
    sub: userID,
    iat: iat,
    exp: iat + expiresIn,
  };

  const token = jwt.sign(payload, secret);

  return token;
}

export async function validateJWT(
  tokenString: string,
  secret: string
): Promise<string> {
  const decoded = jwt.verify(tokenString, secret);
  if (typeof decoded === "string"
    || typeof decoded === "function"
    || Array.isArray(decoded)
    || decoded === null
  ) {
    throw new Error("Invalid token format");
  }

  if (!decoded.sub || typeof decoded.sub !== "string") {
    throw new Error("No subject in JWT token");
  }

  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const auth = req.get("Authorization");
  if (!auth) {
    throw new Error("No Authorization header");
  }

  const prefix = "Bearer ";
  if (!auth.startsWith(prefix)) {
    throw new Error("No bearer token");
  }

  return auth.slice(prefix.length).trim();
} 

