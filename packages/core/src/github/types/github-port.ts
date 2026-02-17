import { type RepoTextFiles } from "./repo-text-files";
import { type GitHubRepo, type ListReposOptions } from "../fetchers/repositories";
import { type RepoRef } from "./repo-ref";

export interface GitHubPort {
  listOrgRepos(args: ListReposOptions): Promise<GitHubRepo[]>;
  fetchRepoTextFiles(args: RepoRef): Promise<RepoTextFiles>;
  fetchRepoLanguageNames(args: RepoRef): Promise<string[]>;
}
