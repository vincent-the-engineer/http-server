import { NextFunction, Request, Response } from "express";

import { config } from "../config.js";
import { respondWithError } from "./json.js";


export function middlewareErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = 500;
  const message = "Something went wrong on our end";

  console.log(err.message);
  respondWithError(res, statusCode, message);
}

export function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.on("finish", () => {
    const statusCode = res.statusCode;
    if (!isStatusCodeOK(statusCode)) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });
  next();
}

export function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction
) {
  config.fileServerHits++;
  next();
}

function isStatusCodeOK(statusCode: number) {
  return statusCode >= 200 && statusCode < 300;
}

