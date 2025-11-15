import type { Request, Response } from "express";

import { BadRequestError } from "./errors.js";
import { respondWithJSON, respondWithError } from "./json.js";
import { NewUser } from "../db/schema.js";
import { createUser } from "../db/queries/users.js";


export async function handlerUsers(req: Request, res: Response) {
  type Parameters = {
    email: string;
  };

  const params: Parameters = req.body;
  if (!params.email) {
    throw new BadRequestError("Missing required email field");
  }

  const user = await createUser({ email: params.email });

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

