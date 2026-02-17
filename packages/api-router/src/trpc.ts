import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.githubToken) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next();
});
