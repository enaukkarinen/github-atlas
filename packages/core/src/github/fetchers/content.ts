import { GitHubClient, GitHubError } from "../github-client";
import { RepoRef } from "../types/repo-ref";

export type RepoTextFiles = {
  readme: string | null;
  codeowners: {
    path: string | null;
    text: string | null;
  };
};

const CODEOWNERS_CANDIDATE_PATHS = [
  ".github/CODEOWNERS",
  "CODEOWNERS",
  "docs/CODEOWNERS",
];

/* ------------------------------------------------------------------ */
/* INTERNAL (client-based) — keep for high-performance ingest loops   */
/* ------------------------------------------------------------------ */

export async function fetchRepoTextFiles(
  client: GitHubClient,
  ref: RepoRef,
): Promise<RepoTextFiles> {
  const [readme, codeowners] = await Promise.all([
    fetchReadme(client, ref),
    fetchCodeowners(client, ref),
  ]);

  return { readme, codeowners };
}

/* ------------------------------------------------------------------ */
/* PUBLIC (token-based) — clean external API                          */
/* ------------------------------------------------------------------ */

export async function fetchRepoTextFilesWithToken(args: {
  githubToken: string;
  ref: RepoRef;
}): Promise<RepoTextFiles> {
  const client = new GitHubClient({ token: args.githubToken });
  return fetchRepoTextFiles(client, args.ref);
}

/* -------------------------- internals ----------------------------- */

async function fetchReadme(
  client: GitHubClient,
  ref: RepoRef,
): Promise<string | null> {
  const q = ref.ref ? `?ref=${encodeURIComponent(ref.ref)}` : "";
  const path = `/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(
    ref.repo,
  )}/readme${q}`;

  try {
    const text = await client.getRaw(path);
    return text || null;
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

async function fetchCodeowners(
  client: GitHubClient,
  ref: RepoRef,
): Promise<{ path: string | null; text: string | null }> {
  const q = ref.ref ? `?ref=${encodeURIComponent(ref.ref)}` : "";

  for (const p of CODEOWNERS_CANDIDATE_PATHS) {
    const path = `/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(
      ref.repo,
    )}/contents/${encodeURIComponent(p)}${q}`;

    try {
      const text = await client.getRaw(path);
      if (text) return { path: p, text };
    } catch (e) {
      if (e instanceof GitHubError && e.status === 404) continue;
      throw e;
    }
  }

  return { path: null, text: null };
}
