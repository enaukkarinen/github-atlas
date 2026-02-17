import crypto from "node:crypto";
import type { Request, Response } from "express";

function baseUrl() {
  const url = process.env.APP_BASE_URL;
  if (!url) throw new Error("APP_BASE_URL is not set");
  return url.replace(/\/$/, "");
}

function githubAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${baseUrl()}/auth/github/callback`,
    scope: "read:org", // add "repo" if you want private repos
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
      redirect_uri: `${baseUrl()}/auth/github/callback`,
    }),
  });

  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!json.access_token) {
    throw new Error(
      `GitHub token exchange failed: ${json.error ?? "unknown"} ${json.error_description ?? ""}`.trim(),
    );
  }

  return json.access_token;
}

// Optional: fetch viewer login for a stable cache scope / display
async function fetchViewerLogin(token: string): Promise<string> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "github-atlas",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch /user (${res.status})`);
  const json = (await res.json()) as { login: string };
  return json.login;
}

export async function githubLogin(req: Request, res: Response) {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;
  res.redirect(githubAuthorizeUrl(state));
}

export async function githubCallback(req: Request, res: Response) {
  const code = String(req.query.code ?? "");
  const state = String(req.query.state ?? "");

  if (!code) return res.status(400).send("Missing code");
  if (!state || state !== req.session.oauthState)
    return res.status(400).send("Invalid state");

  // one-time use
  delete req.session.oauthState;

  const token = await exchangeCodeForToken(code);

  req.session.githubToken = token;

  try {
    req.session.githubLogin = await fetchViewerLogin(token);
  } catch {
    // ignore;
  }

  res.redirect(process.env.WEB_BASE_URL ?? "/");
}

export function githubLogout(req: Request, res: Response) {
  req.session.destroy(() => {
    res.clearCookie("github-atlas.sid");
    res.redirect(process.env.WEB_BASE_URL ?? "/");
  });
}
