import type { Request, Response } from "express";

import { BadRequestError } from "./errors.js";
import { respondWithJSON, respondWithError } from "./json.js";


const maxChirpLength = 140

export async function handlerValidateChirp(req: Request, res: Response) {
  type Parameters = {
    body: string;
  };

  const params: Parameters = req.body;

  if (params.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const profanities = ["kerfuffle", "sharbert", "fornax"];
  const words = params.body.split(" ");

  for (const [index, word] of words.entries()) {
    if (profanities.includes(word.toLowerCase())) {
      words[index] = "****";
    }
  }

  const cleanedBody = words.join(" ");

  respondWithJSON(res, 200, { cleanedBody: cleanedBody });
}

