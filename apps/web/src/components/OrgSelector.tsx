import { useEffect, useMemo, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { trpc } from "../trpc";
import { useOrg } from "../app/OrgContext";

export function OrgSelector() {
  const { org, setOrg } = useOrg();

  const [inputValue, setInputValue] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(inputValue.trim()), 250);
    return () => clearTimeout(t);
  }, [inputValue]);

  // 1) orgs user belongs to
  const myOrgsQuery = trpc.atlas.myOrgs.useQuery(undefined, {
    staleTime: 60_000,
  });

  // 2) search query
  const searchQuery = trpc.atlas.searchOrgs.useQuery(
    { term: debounced, limit: 10 },
    {
      enabled: debounced.length >= 2,
      staleTime: 60_000,
    },
  );

  const options = useMemo(() => {
    const a = myOrgsQuery.data ?? [];
    const b = searchQuery.data ?? [];
    return Array.from(new Set([...a, ...b])).sort();
  }, [myOrgsQuery.data, searchQuery.data]);

  const loading = myOrgsQuery.isLoading || searchQuery.isFetching;

  return (
    <Autocomplete
      size="small"
      // sx={{ width: 240, maxWidth: "100%" }}
      options={options}
      value={org}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, value) => setOrg(value ?? "")}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Organisation"
          placeholder="Type to search..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
