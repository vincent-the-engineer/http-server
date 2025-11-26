import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";


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

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
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

export async function validateJWT(tokenString: string, secret: string): string {
  const decoded = jwt.verify(tokenString, secret);

  return decoded.sub;
}

