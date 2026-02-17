import { z } from "zod";
import type { RepoProfile } from "@github-atlas/graph"; // ✅ use types, not graph
import {
  fetchOrgProfiles,
  listViewerOrgs,
  searchOrgsByLogin,
} from "@github-atlas/core";
import { router, publicProcedure } from "../trpc";
import { fetchOrgProfilesWithToken } from "../../../core/src/github";

export type AtlasCache = {
  get: (key: string) => unknown | undefined;
  set: (key: string, value: unknown) => void;
  delete?: (key: string) => void;
};

export function createAtlasRouter(cache: AtlasCache) {
  return router({
    // orgs the token user belongs to
    myOrgs: publicProcedure.query(async ({ ctx }) => {
      const key = `githubAtlas:myOrgs`;

      const hit = cache.get(key) as string[] | undefined;
      if (hit) return hit;

      const orgs = await listViewerOrgs({ githubToken: ctx.githubToken });
      cache.set(key, orgs);
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

        const key = `githubAtlas:orgSearch:${term.toLowerCase()}:${limit}`;
        const hit = cache.get(key) as string[] | undefined;
        if (hit) return hit;

        const orgs = await searchOrgsByLogin({
          githubToken: ctx.githubToken,
          term,
          limit,
        });

        cache.set(key, orgs);
        return orgs;
      }),

    // profiles for an org
    profiles: publicProcedure
      .input(
        z.object({
          org: z.string().min(1),
          force: z.boolean().optional(),
          // optional: pass through core controls later if needed
          // type: z.enum(["all","public","private","forks","sources","member"]).optional(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const key = `githubAtlas:profiles:${input.org.toLowerCase()}`;

        if (!input.force) {
          const hit = cache.get(key) as RepoProfile[] | undefined;
          if (hit) return { org: input.org, count: hit.length, profiles: hit };
        }

        const profiles = await fetchOrgProfilesWithToken({
          org: input.org,
          githubToken: ctx.githubToken,
        });

        cache.set(key, profiles);
        return { org: input.org, count: profiles.length, profiles };
      }),

    refresh: publicProcedure
      .input(z.object({ org: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const key = `githubAtlas:profiles:${input.org.toLowerCase()}`;

        const profiles = await fetchOrgProfilesWithToken({
          org: input.org,
          githubToken: ctx.githubToken,
        });

        cache.set(key, profiles);

        return {
          ok: true,
          org: input.org,
          refreshedAt: new Date().toISOString(),
          count: profiles.length,
        };
      }),
  });
}
