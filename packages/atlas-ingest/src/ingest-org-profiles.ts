import { GitHubClient } from "./github/github-client";
import { listOrgRepos } from "./github/repos";
import { fetchRepoLanguageNames, fetchRepoTextFiles } from "./github";
import { buildRepoProfile } from "./build-repo-profile";
import type { RepoProfile } from "@gitHub-atlas/types";

export type IngestOrgProfilesArgs = {
  org: string;
  githubToken: string;
  type?: "all" | "public" | "private" | "forks" | "sources" | "member";
  perPage?: number;
  maxPages?: number;
};

export async function ingestOrgProfiles({
  org,
  githubToken,
  type = "public",
  perPage = 100,
  maxPages = 5,
}: IngestOrgProfilesArgs): Promise<RepoProfile[]> {
  const client = new GitHubClient({ token: githubToken });

  const repos = await listOrgRepos(client, {
    org,
    type,
    perPage,
    maxPages,
  });

  const profiles: RepoProfile[] = [];

  for (const r of repos) {
    const [owner, repo] = r.full_name.split("/");

    const files = await fetchRepoTextFiles(client, { owner, repo });
    const languages = await fetchRepoLanguageNames(client, { owner, repo });

    const profile = buildRepoProfile({
      owner,
      repo,
      files,
      languages,
    });

    profiles.push(profile);
  }

  return profiles;
}
