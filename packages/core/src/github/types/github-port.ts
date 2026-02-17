import { RepoTextFiles } from "./repo-text-files";
import { GitHubRepo, ListReposOptions } from "../fetchers/repositories";
import { RepoRef } from "./repo-ref";

export interface GitHubPort {
  listOrgRepos(args: ListReposOptions): Promise<GitHubRepo[]>;
  fetchRepoTextFiles(args: RepoRef): Promise<RepoTextFiles>;
  fetchRepoLanguageNames(args: RepoRef): Promise<string[]>;
}
