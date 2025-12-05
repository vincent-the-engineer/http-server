import type { Request, Response } from "express";

import {
  checkPasswordHash,
  getBearerToken,
  hashPassword,
  makeJWT,
  makeRefreshToken,
} from "./auth.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON, respondWithError } from "./json.js";
import { config } from "../config.js";
import { NewUser, User, RefreshToken } from "../db/schema.js";
import {
  getRefreshToken,
  revokeRefreshToken,
} from "../db/queries/tokens.js";
import { createUser, getUser } from "../db/queries/users.js";


type Parameters = {
  email: string;
  password: string;
};

interface UserObj {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  token?: string;
}

const accessTokenExpiresInSeconds = 3600;


export async function handlerLogin(req: Request, res: Response) {
  const params: Parameters = req.body;
  const errorText = "Incorrect email or password";

  if (!params.email || !params.password) {
    respondWithJSON(res, 401, errorText);
    return;
  }

  const user = await getUser(params.email);
  if (!user) {
    respondWithJSON(res, 401, errorText);
    return;
  }

 const valid = await checkPasswordHash(params.password, user.hashedPassword);

  if (!valid) {
    respondWithJSON(res, 401, errorText);
    return;
 }

  const token = await makeJWT(user.id, accessTokenExpiresInSeconds,
                              config.api.secret);
  const refreshToken = await makeRefreshToken(user.id);

  respondWithJSON(res, 200, getUserObj(user, token, refreshToken));
}

export async function handlerRefresh(req: Request, res: Response) {
  let refreshToken: RefreshToken | undefined;
  try {
    const token = getBearerToken(req);
    refreshToken = await getRefreshToken(token);
  } catch (err) {
    respondWithJSON(res, 401, "Unauthorized");
    return;
  }

  const currentTime = new Date();
  if (!refreshToken
      || currentTime > refreshToken.expiresAt
      || (refreshToken.revokedAt && currentTime > refreshToken.revokedAt)
  ) {
    respondWithJSON(res, 401, "Unauthorized");
    return;
  }

  const token = await makeJWT(
    refreshToken.userId,
    accessTokenExpiresInSeconds,
    config.api.secret
  );

  respondWithJSON(res, 200, { token: token });
}

export async function handlerRevoke(req: Request, res: Response) {
  let refreshToken: RefreshToken | undefined;
  try {
    const token = getBearerToken(req);
    refreshToken = await getRefreshToken(token);
  } catch (err) {
    respondWithJSON(res, 401, "Unauthorized");
    return;
  }

  const currentTime = new Date();
  if (!refreshToken
      || currentTime > refreshToken.expiresAt
      || (refreshToken.revokedAt && currentTime > refreshToken.revokedAt)
  ) {
    respondWithJSON(res, 401, "Unauthorized");
    return;
  }

  const result = await revokeRefreshToken(refreshToken.token, currentTime);
  if (!result) {
    throw new Error("Cannot revoke refresh token");
  }

  res.status(204).end();
}

export async function handlerUsers(req: Request, res: Response) {
  const params: Parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("Missing required email field");
  }

  if (!params.password) {
    throw new BadRequestError("Missing required password field");
  }

  const hash = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashedPassword: hash,
  });

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, getUserObj(user));
}

function getUserObj(
  user: User,
  token: string = "",
  refreshToken: string = ""
) {
  if (!user) {
    throw new Error("Invalid user");
  }

  const userObj: UserObj = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(token && { token: token }),
    ...(refreshToken && { refreshToken: refreshToken }),
  };

  return userObj;
}

