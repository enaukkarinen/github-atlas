import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

type AuthStatus =
  | { state: "loading" }
  | { state: "logged_out" }
  | { state: "logged_in"; login: string };

export function GitHubAuthButton() {
  const [status, setStatus] = useState<AuthStatus>({ state: "loading" });

  const apiBase = "/api";

  async function refreshStatus() {
    setStatus({ state: "loading" });
    const r = await fetch("/auth/status", { credentials: "include" });
    const json = (await r.json()) as {
      loggedIn: boolean;
      login: string | null;
    };

    if (json.loggedIn) {
      setStatus({ state: "logged_in", login: json.login ?? "unknown" });
    } else {
      setStatus({ state: "logged_out" });
    }
  }

  useEffect(() => {
    refreshStatus().catch(() => setStatus({ state: "logged_out" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    await refreshStatus();
  }

  if (status.state === "loading") {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <CircularProgress size={18} />
        <Typography variant="body2">Checking GitHub session…</Typography>
      </Stack>
    );
  }

  if (status.state === "logged_in") {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label={`Signed in as ${status.login}`} variant="outlined" />
        <Button size="small" variant="outlined" onClick={logout}>
          Log out
        </Button>
      </Stack>
    );
  }

  console.log(status);
  return (
    <Button
      variant="contained"
      size="small"
      onClick={() => {
        window.location.href = "/auth/github";
      }}
    >
      Sign in <GitHubIcon fontSize="small" sx={{ ml: 1 }} />
    </Button>
  );
}
