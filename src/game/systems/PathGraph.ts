import type { NodeId, WorldMapConfig, WorldNode } from "../types/world";

export class PathGraph {
  private readonly nodes = new Map<NodeId, WorldNode>();
  private readonly edges = new Map<NodeId, { to: NodeId; cost: number }[]>();

  constructor(config: WorldMapConfig) {
    for (const node of config.nodes) {
      this.nodes.set(node.id, node);
      this.edges.set(node.id, []);
    }

    for (const edge of config.edges) {
      const from = this.edges.get(edge.from);
      const to = this.edges.get(edge.to);
      if (!from || !to) {
        throw new Error(`Invalid edge: ${edge.from} -> ${edge.to}`);
      }

      const a = this.getNode(edge.from);
      const b = this.getNode(edge.to);
      const fallbackCost = Math.hypot(a.x - b.x, a.y - b.y);
      const cost = edge.cost ?? fallbackCost;

      from.push({ to: edge.to, cost });
      to.push({ to: edge.from, cost });
    }
  }

  getNode(id: NodeId): WorldNode {
    const node = this.nodes.get(id);
    if (!node) throw new Error(`Missing node: ${id}`);
    return node;
  }

  hasNode(id: NodeId): boolean {
    return this.nodes.has(id);
  }

  findPath(start: NodeId, goal: NodeId): WorldNode[] {
    if (start === goal) return [this.getNode(start)];

    const open = new Set<NodeId>([start]);
    const cameFrom = new Map<NodeId, NodeId>();
    const gScore = new Map<NodeId, number>();
    const fScore = new Map<NodeId, number>();

    for (const id of this.nodes.keys()) {
      gScore.set(id, Number.POSITIVE_INFINITY);
      fScore.set(id, Number.POSITIVE_INFINITY);
    }

    gScore.set(start, 0);
    fScore.set(start, this.heuristic(start, goal));

    while (open.size > 0) {
      const current = [...open].reduce((best, id) => {
        return (fScore.get(id) ?? Infinity) < (fScore.get(best) ?? Infinity) ? id : best;
      });

      if (current === goal) return this.reconstructPath(cameFrom, current);

      open.delete(current);

      for (const edge of this.edges.get(current) ?? []) {
        const tentative = (gScore.get(current) ?? Infinity) + edge.cost;

        if (tentative < (gScore.get(edge.to) ?? Infinity)) {
          cameFrom.set(edge.to, current);
          gScore.set(edge.to, tentative);
          fScore.set(edge.to, tentative + this.heuristic(edge.to, goal));
          open.add(edge.to);
        }
      }
    }

    throw new Error(`No path found from ${start} to ${goal}`);
  }

  private heuristic(aId: NodeId, bId: NodeId) {
    const a = this.getNode(aId);
    const b = this.getNode(bId);
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private reconstructPath(cameFrom: Map<NodeId, NodeId>, current: NodeId) {
    const ids = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!;
      ids.unshift(current);
    }

    return ids.map((id) => this.getNode(id));
  }
}
