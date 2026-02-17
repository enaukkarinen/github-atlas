import type { Express } from "express";
import { githubLogin, githubCallback, githubLogout } from "../auth/github";

export function registerAuthRoutes(app: Express) {
  app.get("/auth/github", githubLogin);

  app.get("/auth/github/callback", (req, res, next) => {
    githubCallback(req, res).catch(next);
  });

  app.post("/auth/logout", githubLogout);

  app.get("/auth/status", (req, res) => {
    res.json({
      loggedIn: Boolean(req.session.githubToken),
      login: req.session.githubLogin ?? null,
    });
  });

  app.get("/auth/debug", (req, res) => {
    res.json({
      hasSession: Boolean(req.session),
      sessionID: req.sessionID,
      hasToken: Boolean(req.session.githubToken),
      cookie: req.headers.cookie ?? null,
    });
  });
}
