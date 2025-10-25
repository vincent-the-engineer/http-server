import express from "express";

import { middlewareLogResponses } from "./middleware.js";


const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get("/healthz", (req, res) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
})

