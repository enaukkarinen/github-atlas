// lib/positions.ts
import type { AtlasNode } from "@github-atlas/graph";
import { layoutNodes } from "./layout-nodes";

export function buildPositions(items: AtlasNode[]) {
  return layoutNodes(items);
}
