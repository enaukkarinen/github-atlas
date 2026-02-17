import type { AtlasEdge } from "@github-atlas/graph";

export function connectedNodeIds(
  edges: AtlasEdge[],
  activeId: string,
): Set<string> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    (adj.get(e.source) ?? adj.set(e.source, []).get(e.source)!).push(e.target);
    (adj.get(e.target) ?? adj.set(e.target, []).get(e.target)!).push(e.source);
  }

  const seen = new Set<string>([activeId]);
  const q = [activeId];

  while (q.length) {
    const cur = q.shift()!;
    for (const nxt of adj.get(cur) ?? []) {
      if (!seen.has(nxt)) {
        seen.add(nxt);
        q.push(nxt);
      }
    }
  }

  return seen;
}
