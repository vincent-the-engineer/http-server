import express from "express";

import { config } from "./config.js";
import { handlerValidateChirp } from "./api/chirps.js";
import { handlerMetrics } from "./api/metrics.js";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerReset } from "./api/reset.js";
import { handlerStatus } from "./api/status.js";


const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
app.get("/api/healthz", handlerStatus);
app.post("/api/validate_chirp", handlerValidateChirp);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

