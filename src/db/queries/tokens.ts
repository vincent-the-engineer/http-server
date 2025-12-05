import { eq } from "drizzle-orm";

import { db } from "../index.js";
import {
  NewRefreshToken,
  RefreshToken,
  refreshTokens,
} from "../schema.js";


export async function createRefreshToken(refreshToken: NewRefreshToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(refreshToken)
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function getRefreshToken(token: string) {
  const result = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));

  if (result.length === 0) {
    return;
  }

  return result[0];
}

export async function revokeRefreshToken(token: string, revokedAt: Date) {
  const result = await db
    .update(refreshTokens)
    .set({ revokedAt: revokedAt })
    .where(eq(refreshTokens.token, token))
    .returning();

  if (result.length === 0) {
    return;
  }

  return result[0];
}

