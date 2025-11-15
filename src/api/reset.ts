import type { Request, Response } from "express";

import { config } from "../config.js";
import { ForbiddenError } from "./errors.js";
import { resetDatabase } from "../db/queries/reset.js";


export async function handlerReset(_: Request, res: Response) {
  if (config.api.platform !== "dev") {
    console.log(config.api.platform);
    throw new ForbiddenError("Reset is only available in dev environment.");
  }

  await resetDatabase();
  config.api.fileServerHits = 0;

  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits reset to 0");
}

