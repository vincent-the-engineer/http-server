import { NextFunction, Request, Response } from "express";


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

function isStatusCodeOK(statusCode: number) {
  return statusCode >= 200 && statusCode < 300;
}

