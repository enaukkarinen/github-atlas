import {
  AppBar,
  Box,
  TextField,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { OrgSelector } from "./OrgSelector";
import { useOrg } from "../app/OrgContext";

export function Navbar() {
  const { org, setOrg } = useOrg();
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button component={RouterLink} to="/">
            <AccountTreeOutlinedIcon fontSize="small" />
            <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
              GitHub Atlas
            </Typography>
          </Button>
        </Box>

        <OrgSelector value={org} onChange={setOrg} />

        <Box sx={{ flex: 1 }} />

        {/* Global search (stub for now) */}
        <TextField
          size="small"
          placeholder="Search repos, systems, docs…"
          sx={{
            width: 380,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(0,0,0,0.25)",
            },
          }}
          inputProps={{ "aria-label": "Search" }}
        />

        <Box sx={{ width: 8 }} />
      </Toolbar>
    </AppBar>
  );
}
