import { z } from "zod";
import type { RepoProfile } from "@github-atlas/types";
import { router, publicProcedure } from "../trpc";

export type AtlasDeps = {
  ingestOrgProfiles: (args: { org: string; githubToken: string }) => Promise<RepoProfile[]>;
  cache: {
    get: (key: string) => RepoProfile[] | undefined;
    set: (key: string, value: RepoProfile[]) => void;
    delete?: (key: string) => void;
  };
};

export function createAtlasRouter(deps: AtlasDeps) {
  return router({
    profiles: publicProcedure
      .input(z.object({ org: z.string().min(1), force: z.boolean().optional() }))
      .query(async ({ input, ctx }) => {
        const key = input.org.toLowerCase();

        if (!input.force) {
          const hit = deps.cache.get(key);
          if (hit) return { org: input.org, count: hit.length, profiles: hit };
        }

        const profiles = await deps.ingestOrgProfiles({
          org: input.org,
          githubToken: ctx.githubToken,
        });

        deps.cache.set(key, profiles);
        return { org: input.org, count: profiles.length, profiles };
      }),

    refresh: publicProcedure
      .input(z.object({ org: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const profiles = await deps.ingestOrgProfiles({
          org: input.org,
          githubToken: ctx.githubToken,
        });

        deps.cache.set(input.org.toLowerCase(), profiles);
        return { ok: true, org: input.org, refreshedAt: new Date().toISOString(), count: profiles.length };
      }),
  });
}
