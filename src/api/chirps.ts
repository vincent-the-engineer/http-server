import type { Request, Response } from "express";

import { BadRequestError } from "./errors.js";
import { respondWithJSON, respondWithError } from "./json.js";
import { NewChirp } from "../db/schema.js";
import { createChirp } from "../db/queries/chirps.js";


const maxChirpLength = 140
const profanities = ["kerfuffle", "sharbert", "fornax"];

export async function handlerCreateChirp(req: Request, res: Response) {
  type Parameters = {
    body: string;
    userId: string;
  };

  const params: Parameters = req.body;

  if (!params.userId) {
    throw new BadRequestError("No user ID for Chirp");
  }

  const body = validateChirp(params.body);
  const chirp = await createChirp({ body: body, userId: params.userId});

  if (!chirp) {
    throw new Error("Could not create chirp");
  }

  respondWithJSON(res, 201, {
    id: chirp.id,
    createdAt: chirp.createdAt,
    updatedAt: chirp.updatedAt,
    body: chirp.body,
    userId: chirp.userId,
  });
}

function validateChirp(body: string) {
  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`
    );
  }

  return getCleanedBody(body, profanities);
}

function getCleanedBody(body: string, profanities: string[]) {
  const words = body.split(" ");

  for (const [index, word] of words.entries()) {
    if (profanities.includes(word.toLowerCase())) {
      words[index] = "****";
    }
  }

  const cleanedBody = words.join(" ");

  return cleanedBody;
}

