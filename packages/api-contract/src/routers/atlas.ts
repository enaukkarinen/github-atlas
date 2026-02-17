import { z } from "zod";
import type { RepoProfile } from "@github-atlas/types";
import { router, publicProcedure } from "../trpc";

export type AtlasDeps = {
  ingestOrgProfiles: (args: {
    org: string;
    githubToken: string;
  }) => Promise<RepoProfile[]>;
  listViewerOrgs: (args: { githubToken: string }) => Promise<string[]>;
  searchOrgsByLogin: (args: {
    githubToken: string;
    term: string;
    limit?: number;
  }) => Promise<string[]>;
  cache: {
    get: (key: string) => unknown | undefined;
    set: (key: string, value: unknown) => void;
    delete?: (key: string) => void;
  };
};

export function createAtlasRouter(deps: AtlasDeps) {
  return router({
    // orgs the token user belongs to
    myOrgs: publicProcedure.query(async ({ ctx }) => {
      const key = "myOrgs";
      const hit = deps.cache.get(key) as string[] | undefined;
      if (hit) return hit;

      const orgs = await deps.listViewerOrgs({ githubToken: ctx.githubToken });
      deps.cache.set(key, orgs);
      return orgs;
    }),

    // typeahead org search
    searchOrgs: publicProcedure
      .input(
        z.object({
          term: z.string().min(1),
          limit: z.number().min(1).max(20).optional(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const term = input.term.trim();
        const limit = input.limit ?? 10;

        const key = `orgSearch:${term.toLowerCase()}:${limit}`;
        const hit = deps.cache.get(key) as string[] | undefined;
        if (hit) return hit;

        const orgs = await deps.searchOrgsByLogin({
          githubToken: ctx.githubToken,
          term,
          limit,
        });

        deps.cache.set(key, orgs);
        return orgs;
      }),

    // Existing: profiles for an org
    profiles: publicProcedure
      .input(
        z.object({ org: z.string().min(1), force: z.boolean().optional() }),
      )
      .query(async ({ input, ctx }) => {
        const key = `profiles:${input.org.toLowerCase()}`;

        if (!input.force) {
          const hit = deps.cache.get(key) as RepoProfile[] | undefined;
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

        deps.cache.set(`profiles:${input.org.toLowerCase()}`, profiles);
        return {
          ok: true,
          org: input.org,
          refreshedAt: new Date().toISOString(),
          count: profiles.length,
        };
      }),
  });
}
