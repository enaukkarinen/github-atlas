import {
  AppBar,
  Box,
  TextField,
  Toolbar,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import { OrgSelector } from "./OrgSelector";
import { GitHubAuthButton } from "./GitHubAuthButton";

export function Navbar() {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        sx={{
          gap: 2,
          minHeight: 64,
        }}
      >
        {/* Left: Brand */}
        <Button
          component={RouterLink}
          to="/"
          sx={{ display: "flex", gap: 1, alignItems: "center" }}
        >
          <AccountTreeOutlinedIcon fontSize="small" />
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
            GitHub Atlas
          </Typography>
        </Button>

        {/* Middle: Global search (primary) */}
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <TextField
            size="small"
            placeholder="Search repos, systems, docs…"
            sx={{
              width: "min(680px, 100%)",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(0,0,0,0.25)",
              },
            }}
            inputProps={{ "aria-label": "Search" }}
          />
        </Box>

        {/* Right: Account + org */}
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ flexShrink: 0 }}
        >
          <GitHubAuthButton />

          <Box sx={{ width: 240 }}>
            <OrgSelector />
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
