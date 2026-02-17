import "express-session";

declare module "express-session" {
  interface SessionData {
    githubToken?: string;
    githubLogin?: string;
    oauthState?: string;
  }
}
