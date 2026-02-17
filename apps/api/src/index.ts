import "dotenv/config";
import express from "express";
import cors from "cors";

import { configureSession } from "./middleware/session";
import { registerAuthRoutes } from "./routes/auth";
import { registerHealthRoutes } from "./routes/health";
import { registerTrpc } from "./trpc/register";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [process.env.WEB_BASE_URL ?? "http://localhost:5173"],
    credentials: true,
  }),
);

// Sessions (must come before auth routes + trpc context)
configureSession(app);

// Routes
registerHealthRoutes(app);
registerAuthRoutes(app);

// tRPC
registerTrpc(app);

// Basic error handler (keeps async route rejections readable)
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).send("Internal Server Error");
  },
);

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
