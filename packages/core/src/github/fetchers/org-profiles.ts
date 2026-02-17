import { type GitHubPort } from "../types/github-port";
import { buildRepoProfile } from "../../mappers/build-repo-profile";
import type { RepoProfile } from "@gitHub-atlas/graph";
import { createGitHubAdapterWithToken } from "../create-adapter";

export type FetchOrgProfilesArgs = {
  org: string;
  type?: "all" | "public" | "private" | "forks" | "sources" | "member";
  perPage?: number;
  maxPages?: number;
};

export type FetchOrgProfilesWithTokenArgs = FetchOrgProfilesArgs & {
  githubToken: string;
};

export async function fetchOrgProfilesWithToken(
  args: FetchOrgProfilesWithTokenArgs,
): Promise<RepoProfile[]> {
  const github = createGitHubAdapterWithToken(args.githubToken); 
  const { githubToken: _token, ...rest } = args;
  return fetchOrgProfiles(github, rest);
}

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
