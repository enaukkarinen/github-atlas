import { router } from "./trpc";
import { healthRouter } from "./routers/health";
import { createAtlasRouter, type AtlasDeps } from "./routers/atlas";

export function createAppRouter(deps: AtlasDeps) {
  return router({
    health: healthRouter,
    atlas: createAtlasRouter(deps),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;