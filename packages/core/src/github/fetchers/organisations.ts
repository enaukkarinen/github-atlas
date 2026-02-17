import { GitHubClient } from "../github-client";

export async function listViewerOrgs(args: {
  githubToken: string;
}): Promise<string[]> {
  const client = new GitHubClient({ token: args.githubToken });

  const orgs = await client.getJson<Array<{ login: string }>>(
    "/user/orgs?per_page=100",
  );

  return orgs.map((o) => o.login);
}

export async function searchOrgsByLogin(args: {
  githubToken: string;
  term: string;
  limit?: number;
}): Promise<string[]> {
  const client = new GitHubClient({ token: args.githubToken });

  const q = `type:org in:login ${args.term}`;
  const path = `/search/users?q=${encodeURIComponent(q)}&per_page=${args.limit ?? 10}`;

  const res = await client.getJson<{ items: Array<{ login: string }> }>(path);
  return res.items.map((i) => i.login);
}
