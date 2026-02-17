import { createAppRouter } from "@github-atlas/api-router";
import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, any>({ max: 500 });

export const appRouter = createAppRouter(cache);
export type AppRouter = typeof appRouter;
