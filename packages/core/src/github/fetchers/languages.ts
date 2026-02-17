import { GitHubClient } from "../github-client";
import { RepoRef } from "../types/repo-ref";

export type RepoLanguages = Record<string, number>;

/* ------------------------------------------------------------------ */
/* INTERNAL (client-based) — keep for high-performance ingest loops   */
/* ------------------------------------------------------------------ */

export async function fetchRepoLanguages(
  client: GitHubClient,
  ref: RepoRef,
): Promise<RepoLanguages> {
  const path = `/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(
    ref.repo,
  )}/languages`;

  return await client.getJson<RepoLanguages>(path);
}

export async function fetchRepoLanguageNames(
  client: GitHubClient,
  ref: RepoRef,
): Promise<string[]> {
  const langs = await fetchRepoLanguages(client, ref);

  return Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

/* ------------------------------------------------------------------ */
/* PUBLIC (token-based) — clean external API                          */
/* ------------------------------------------------------------------ */

export async function fetchRepoLanguagesWithToken(
  args: { githubToken: string; ref: RepoRef },
): Promise<RepoLanguages> {
  const client = new GitHubClient({ token: args.githubToken });
  return fetchRepoLanguages(client, args.ref);
}

export async function fetchRepoLanguageNamesWithToken(
  args: { githubToken: string; ref: RepoRef },
): Promise<string[]> {
  const client = new GitHubClient({ token: args.githubToken });
  return fetchRepoLanguageNames(client, args.ref);
}
