import type { Express } from "express";
import { githubLogin, githubCallback, githubLogout } from "../auth/github";

export function registerAuthRoutes(app: Express) {
  app.get("/auth/github", githubLogin);

  app.get("/auth/github/callback", (req, res, next) => {
    githubCallback(req, res).catch(next);
  });

  app.post("/auth/logout", githubLogout);
}
