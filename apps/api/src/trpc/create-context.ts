import type { Request } from "express";
import { TRPCError } from "@trpc/server";
import type { Context } from "@github-atlas/api-router";

function tokenFallbackScope(token: string) {
  return token.slice(0, 8);
}

export function createContext({ req }: { req: Request }): Context {
  const token = req.session.githubToken;

  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return {
    githubToken: token,
    cacheScope: req.session.githubLogin ?? tokenFallbackScope(token),
    req: {
      method: req.method,
      originalUrl: req.originalUrl,
    },
  };
}
