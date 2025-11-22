import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import { config } from "./config.js";
import {
  handlerCreateChirp,
  handlerGetChirp,
  handlerGetChirps,
} from "./api/chirps.js";
import { handlerMetrics } from "./api/metrics.js";
import {
  middlewareErrorHandler,
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerReset } from "./api/reset.js";
import { handlerStatus } from "./api/status.js";
import { handlerUsers } from "./api/users.js";


const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});

app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});

app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerGetChirps(req, res)).catch(next);
});

app.get("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(handlerGetChirp(req, res)).catch(next);
});

app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerCreateChirp(req, res)).catch(next);
});

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerStatus(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerUsers(req, res)).catch(next);
});

app.use(middlewareErrorHandler);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});

