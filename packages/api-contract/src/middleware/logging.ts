import { t } from "../trpc-base";

const loggingEnabled = !!process.env.TRPC_LOGGING;

export const loggingMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!loggingEnabled) return next();

  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  const method = ctx.req?.method?.toUpperCase() ?? "UNKNOWN";

  console.log(`[${method}] - ${ctx.req?.originalUrl} (${duration}ms)`);

  return result;
});
