import type { Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./create-context";

import { createAppRouter } from "@github-atlas/api-router";
import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, any>({ max: 500 });

export const appRouter = createAppRouter(cache);

export function registerTrpc(app: Express) {
  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError({ error, path }) {
        if (process.env.TRPC_LOGGING === "1") {
          console.error(`[tRPC] ${path ?? "unknown"}:`, error);
        }
      },
    }),
  );
}
