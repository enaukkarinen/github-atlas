import { Box, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";

const ORG_STORAGE_KEY = "github-atlas:lastOrg";

function getInitialOrg(defaultOrg: string) {
  return localStorage.getItem(ORG_STORAGE_KEY) ?? defaultOrg;
}

type OrgSelectorProps = {
  value: string; // currently active org (from parent)
  onChange: (org: string) => void;
  defaultOrg?: string;
};

export function OrgSelector({
  value,
  onChange,
  defaultOrg = "backstage",
}: OrgSelectorProps) {
  const [input, setInput] = useState(() => getInitialOrg(defaultOrg));

  // keep input aligned if parent changes org externally
  useEffect(() => {
    setInput(value);
  }, [value]);

  const submit = () => {
    const next = input.trim();
    if (!next) return;

    localStorage.setItem(ORG_STORAGE_KEY, next);
    onChange(next);
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <TextField
        size="small"
        label="GitHub org"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />

      <Button
        variant="contained"
        onClick={submit}
        disabled={!input.trim() || input.trim() === value}
      >
        Load
      </Button>
    </Box>
  );
}
