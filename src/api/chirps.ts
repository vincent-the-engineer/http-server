import type { Request, Response } from "express";

import { respondWithJSON, respondWithError } from "./json.js";


const maxChirpLength = 140

export async function handlerValidateChirp(req: Request, res: Response) {
  type Parameters = {
    body: string;
  };

  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    let params: Parameters;

    try {
      params = JSON.parse(body);
    } catch (error) {
      respondWithError(res, 400, "Invalid JSON");
      return;
    }

    if (params.body.length > maxChirpLength) {
      respondWithError(res, 400, "Chirp is too long");
      return;
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
  });
}

