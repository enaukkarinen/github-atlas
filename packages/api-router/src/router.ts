import { router } from "./trpc";
import { healthRouter } from "./routers/health";
import { type AtlasCache, createAtlasRouter } from "./routers/atlas";

export function createAppRouter(deps: AtlasCache) {
  return router({
    health: healthRouter,
    atlas: createAtlasRouter(deps),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
