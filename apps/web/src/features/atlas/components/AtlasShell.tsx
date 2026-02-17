import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { AtlasGraph } from "./AtlasGraph";
import { AtlasSidePanel } from "./AtlasSidePanel";

import type { RepoProfile } from "@github-atlas/graph";
import { buildOwnershipGraph } from "../adapters/build-ownership-graph";
import { createOwnerMap } from "../adapters/create-owner-map";
import { useOrg } from "../../../app/OrgContext";

const RIGHT_PANEL_WIDTH = 380;

export function AtlasShell({ profiles }: { profiles: RepoProfile[] }) {
  const { org } = useOrg();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const graph = useMemo(() => buildOwnershipGraph(profiles), [profiles]);
  const ownerMap = useMemo(() => createOwnerMap(profiles), [profiles]);

  const selectedNode = selectedId
    ? (graph.nodes.find((n) => n.id === selectedId) ?? null)
    : null;

  const repoById = useMemo(() => {
    const m: Record<string, RepoProfile> = {};
    for (const p of profiles) m[`repo:${p.owner}/${p.name}`] = p;
    return m;
  }, [profiles]);

  return (
    <Box sx={{ display: "flex", height: "100%", minHeight: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AtlasGraph
          graph={graph}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </Box>

      <Box
        sx={{
          width: RIGHT_PANEL_WIDTH,
          flexShrink: 0,
          borderLeft: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          height: "100%",
          overflow: "auto",
        }}
      >
        <AtlasSidePanel
          node={selectedNode}
          graph={graph}
          ownerMap={ownerMap}
          repoById={repoById}
        />
      </Box>
    </Box>
  );
}
