import type { Request, Response } from "express";

export async function handlerStatus(_: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

