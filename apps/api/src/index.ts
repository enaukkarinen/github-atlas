import "dotenv/config";

import express from "express";
import cors from "cors";
import { LRUCache } from "lru-cache";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import {
  fetchOrgProfiles,
  listViewerOrgs,
  searchOrgsByLogin,
} from "@github-atlas/core";

import { createAppRouter, type Context } from "@github-atlas/api-router";

// ---------------------------------------------------------------------
// env
// ---------------------------------------------------------------------

const port = Number(process.env.PORT ?? 4000);
const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  throw new Error("GITHUB_TOKEN is not set");
}

// ---------------------------------------------------------------------
// cache
// ---------------------------------------------------------------------

const ttlMs = Number(process.env.ATLAS_CACHE_TTL_MS ?? 15 * 60_000);

const cache = new LRUCache<string, any>({
  max: 100,
  ttl: ttlMs,
});

// ---------------------------------------------------------------------
// router
// ---------------------------------------------------------------------

const appRouter = createAppRouter({
  fetchOrgProfiles,
  listViewerOrgs,
  searchOrgsByLogin,
  cache,
})

// ---------------------------------------------------------------------
// express
// ---------------------------------------------------------------------

const app = express();

app.use(cors({ origin: true }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,

    createContext({ req }): Context {
      return {
        githubToken,
        req: {
          method: req.method,
          originalUrl: req.originalUrl,
        },
      };
    },

    onError({ error, path }) {
      if (process.env.TRPC_LOGGING === "1") {
        console.error(`[tRPC] ${path ?? "unknown"}:`, error);
      }
    },
  }),
);

// ---------------------------------------------------------------------
// start
// ---------------------------------------------------------------------

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
