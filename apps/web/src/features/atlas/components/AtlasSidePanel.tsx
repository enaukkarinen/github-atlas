import {
  Box,
  Divider,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type {
  AtlasEdge,
  AtlasGraph,
  AtlasNode,
  RepoProfile,
} from "@gitHub-atlas/types";
import type { RepoOwnership } from "../adapters/create-owner-map";

function repoFullNameFromId(id: string): string | null {
  return id.startsWith("repo:") ? id.slice("repo:".length) : null;
}

function isRepoNodeId(id: string): boolean {
  return id.startsWith("repo:");
}

export function AtlasSidePanel({
  node,
  graph,
  ownerMap,
  repoById,
}: {
  node: AtlasNode | null;
  graph: AtlasGraph;
  ownerMap: Record<string, RepoOwnership>;
  repoById: Record<string, RepoProfile>;
}) {
  const navigate = useNavigate();

  const ownsCount =
    node?.type === "team"
      ? graph.edges.filter(
          (e: AtlasEdge) => e.type === "owns" && e.source === node.id,
        ).length
      : null;

  const ownership = node?.type === "repo" ? ownerMap[node.id] : null;

  const hasOwners =
    ownership && (ownership.teams.length > 0 || ownership.users.length > 0);

  const repo = node?.type === "repo" ? repoById[node.id] : null;

  const relatedRepoIds = useMemo(() => {
    if (!node) return [];

    // Owns: team -> repo
    if (node.type === "team") {
      return graph.edges
        .filter(
          (e) =>
            e.type === "owns" && e.source === node.id && isRepoNodeId(e.target),
        )
        .map((e) => e.target);
    }

    // Uses: language -> repo (per your edge comment)
    if (node.type === "language") {
      return graph.edges
        .filter(
          (e) =>
            e.type === "uses" && e.source === node.id && isRepoNodeId(e.target),
        )
        .map((e) => e.target);
    }

    return [];
  }, [node, graph.edges]);

  const openRepoPage = (repoId: string) => {
    const fullName = repoFullNameFromId(repoId);
    if (!fullName) return;
    navigate(`/repo/${encodeURIComponent(fullName)}`);
  };

  const title =
    node?.type === "team"
      ? "Team"
      : node?.type === "repo"
        ? "Repository"
        : node?.type === "language"
          ? "Language"
          : "Selection";

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {node ? node.label : "Select a team, repo, or language in the atlas."}
      </Typography>

      {/* Repo drill-down */}
      {node?.type === "repo" && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => openRepoPage(node.id)}
          >
            Open repo page
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* CODEOWNERS */}
      <Typography variant="subtitle2">CODEOWNERS</Typography>

      {node?.type === "team" ? (
        <Typography variant="body2" color="text.secondary">
          Owns {ownsCount} repos
        </Typography>
      ) : node?.type === "repo" ? (
        ownership ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Source: {ownership.source}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              Teams
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ownership.teams.length
                ? ownership.teams.map((t) => `@${t}`).join(", ")
                : "—"}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ownership.users.length
                ? ownership.users.map((u) => `@${u}`).join(", ")
                : "—"}
            </Typography>

            {!hasOwners && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No owners found in CODEOWNERS.
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No CODEOWNERS data for this repo.
          </Typography>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          —
        </Typography>
      )}

      {/* Languages */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2">Languages</Typography>
      <Typography variant="body2" color="text.secondary">
        {node?.type === "repo"
          ? repo?.languages?.length
            ? repo.languages.join(", ")
            : "—"
          : node?.type === "language"
            ? node.label
            : "—"}
      </Typography>

      {/* Connected repos list (for team/language) */}
      {(node?.type === "team" || node?.type === "language") && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Connected repositories
          </Typography>

          {relatedRepoIds.length ? (
            <List dense disablePadding>
              {relatedRepoIds.map((rid) => {
                const fullName = repoFullNameFromId(rid) ?? rid;
                return (
                  <ListItemButton
                    key={rid}
                    sx={{ px: 0.5, borderRadius: 1 }}
                    onClick={() => openRepoPage(rid)}
                  >
                    <ListItemText
                      primary={fullName}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
