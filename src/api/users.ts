import type { Request, Response } from "express";

import { checkPasswordHash, hashPassword } from "./auth.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON, respondWithError } from "./json.js";
import { NewUser, User } from "../db/schema.js";
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
}

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

  respondWithJSON(res, 200, getUserObj(user));
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

function getUserObj(user: User) {
  if (!user) {
    throw new Error("Invalid user");
  }

  const userObj: UserObj = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return userObj;
}

