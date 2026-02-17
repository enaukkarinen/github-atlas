import { Router } from "express";
import { githubLogin, githubCallback, githubLogout } from "../auth/github";

export const authRouter = Router();

authRouter.get("/github", githubLogin);

authRouter.get("/github/callback", (req, res, next) => {
  githubCallback(req, res).catch(next);
});

authRouter.post("/logout", githubLogout);

authRouter.get("/status", (req, res) => {
  res.json({
    loggedIn: Boolean(req.session.githubToken),
    login: req.session.githubLogin ?? null,
  });
});

authRouter.get("/debug", (req, res) => {
  res.json({
    hasSession: Boolean(req.session),
    sessionID: req.sessionID,
    hasToken: Boolean(req.session.githubToken),
    cookie: req.headers.cookie ?? null,
  });
});
