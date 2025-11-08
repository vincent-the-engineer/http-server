import type { Request, Response } from "express";

import { respondWithJSON, respondWithError } from "./json.js";


const maxChirpLength = 140

export async function handlerValidateChirp(req: Request, res: Response) {
  type Parameters = {
    body: string;
  };

  const body = await readBody(req);
  let params: Parameters;

  try {
    params = JSON.parse(body);
  } catch (error) {
    respondWithError(res, 400, "Invalid JSON");
    return;
  }

  if (params.body.length > maxChirpLength) {
    throw new Error("Chirp is too long");
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

function readBody(req: Request): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

