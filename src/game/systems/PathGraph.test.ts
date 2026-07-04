import { describe, expect, it } from "vitest";
import worldMap from "../data/world-map.json";
import type { WorldMapConfig } from "../types/world";
import { PathGraph } from "./PathGraph";

const map = worldMap as WorldMapConfig;

describe("PathGraph", () => {
  it("finds a route from center to every MVP building", () => {
    const graph = new PathGraph(map);

    for (const building of map.buildings) {
      const path = graph.findPath(map.startNodeId, building.targetNodeId);
      expect(path[0]?.id).toBe(map.startNodeId);
      expect(path.at(-1)?.id).toBe(building.targetNodeId);
      expect(path.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("rejects missing nodes clearly", () => {
    const graph = new PathGraph(map);

    expect(() => graph.getNode("missing")).toThrow("Missing node: missing");
  });

  it("keeps all building target nodes valid", () => {
    const graph = new PathGraph(map);

    for (const building of map.buildings) {
      expect(graph.hasNode(building.targetNodeId), building.id).toBe(true);
    }
  });
});
