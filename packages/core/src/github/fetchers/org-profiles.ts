import { GitHubPort } from "../types/github-port";
import { buildRepoProfile } from "../../mappers/build-repo-profile";
import type { RepoProfile } from "@gitHub-atlas/graph";

export type FetchOrgProfilesArgs = {
  org: string;
  githubToken: string;
  type?: "all" | "public" | "private" | "forks" | "sources" | "member";
  perPage?: number;
  maxPages?: number;
};

export async function fetchOrgProfiles(
  github: GitHubPort,
  args: FetchOrgProfilesArgs,
): Promise<RepoProfile[]> {
  const { org, type = "public", perPage = 100, maxPages = 5 } = args;

  const repos = await github.listOrgRepos({
    org,
    type,
    perPage,
    maxPages,
  });

  const profiles: RepoProfile[] = [];

  for (const r of repos) {
    const [owner, repo] = r.full_name.split("/");

    const files = await github.fetchRepoTextFiles({ owner, repo });
    const languages = await github.fetchRepoLanguageNames({ owner, repo });

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
