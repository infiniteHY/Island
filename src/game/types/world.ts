export type NodeId = string;

export type BuildingId =
  | "library"
  | "sports"
  | "finance"
  | "arcade"
  | "gallery"
  | "jazz"
  | "world_tree"
  | "travel"
  | "future";

export type WorldNode = {
  id: NodeId;
  x: number;
  y: number;
};

export type WorldEdge = {
  from: NodeId;
  to: NodeId;
  cost?: number;
};

export type PolygonHotspot = {
  type: "polygon";
  points: [number, number][];
};

export type RectHotspot = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BuildingConfig = {
  id: BuildingId;
  name: string;
  title: string;
  subtitle: string;
  targetNodeId: NodeId;
  route: string;
  hotspot: PolygonHotspot | RectHotspot;
  effects?: {
    hover?: string;
    arrival?: string;
  };
};

export type WorldMapConfig = {
  meta: {
    width: number;
    height: number;
    version: number;
  };
  startNodeId: NodeId;
  nodes: WorldNode[];
  edges: WorldEdge[];
  buildings: BuildingConfig[];
};
