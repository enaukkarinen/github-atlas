import "dotenv/config";
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { LRUCache } from "lru-cache";

import type { RepoProfile } from "@github-atlas/types";
import { ingestOrgProfiles } from "@github-atlas/ingest";

import { createAppRouter, type Context } from "@github-atlas/api-contract";

const port = Number(process.env.PORT ?? 4000);
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) throw new Error("GITHUB_TOKEN is not set");

const ttlMs = Number(process.env.ATLAS_CACHE_TTL_MS ?? 15 * 60_000);
const cache = new LRUCache<string, RepoProfile[]>({ max: 50, ttl: ttlMs });

const enableLogging = process.env.TRPC_LOGGING === "1";

const appRouter = createAppRouter({
  ingestOrgProfiles,
  cache: {
    get: (k) => cache.get(k),
    set: (k, v) => cache.set(k, v),
    delete: (k) => cache.delete(k),
  },
});

const app = express();

app.use(cors({ origin: true }));

// Server-only request logging (replaces contract-level middleware)
if (enableLogging) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[${req.method}] - ${req.originalUrl} (${duration}ms)`);
    });
    next();
  });
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext({ req }): Context {
      // Keep Context browser-safe (no Node globals in api-contract)
      return {
        githubToken,
        req: { method: req.method, originalUrl: req.originalUrl },
      };
    },
  }),
);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
