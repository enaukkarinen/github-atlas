import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";

import { trpc } from "../../../trpc"; // adjust path

function TrpcPingTest() {
  const q = trpc.health.ping.useQuery();

  if (q.isLoading) return <div>Loading…</div>;
  if (q.error) return <div>Error: {q.error.message}</div>;

  return <pre>{JSON.stringify(q.data, null, 2)}</pre>;
}

export function RepoPage() {
  const { fullName } = useParams();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Repo</Typography>
      <Typography variant="body2" color="text.secondary">
        {fullName}
      </Typography>
      <TrpcPingTest />
    </Box>
  );
}
