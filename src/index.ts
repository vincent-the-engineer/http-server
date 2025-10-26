import express from "express";

import { config } from "./config.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerStatus } from "./api/status.js";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middleware.js";


const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/healthz", handlerStatus);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

