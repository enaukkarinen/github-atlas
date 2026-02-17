import { fetchRepoTextFiles } from "./fetchers/content";
import { fetchRepoLanguageNames } from "./fetchers/languages";
import { listOrgRepos } from "./fetchers/repositories";
import { GitHubClient } from "./github-client";
import { type GitHubPort } from "./types/github-port";

export function createGitHubAdapterWithToken(token: string): GitHubPort {
  const client = new GitHubClient({ token });
  return {
    listOrgRepos: (args) => listOrgRepos(client, args),
    fetchRepoTextFiles: (args) => fetchRepoTextFiles(client, args),
    fetchRepoLanguageNames: (args) => fetchRepoLanguageNames(client, args),
  };
}
