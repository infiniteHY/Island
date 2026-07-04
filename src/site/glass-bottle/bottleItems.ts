export type BottleItemId = "bass" | "camera" | "skill" | "market" | "world";

export type BottleItemConfig = {
  id: BottleItemId;
  label: string;
  subtitle: string;
  route: string;
  startPosition: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  accent: string;
  body: string;
};

export const BOTTLE_ITEMS: BottleItemConfig[] = [
  {
    id: "bass",
    label: "Bass",
    subtitle: "Jazz bar / music theory",
    route: "#jazz",
    startPosition: [-0.22, 3.5, 0.06],
    rotation: [0.1, 0.25, -0.38],
    scale: 0.92,
    accent: "#d6a75d",
    body: "#2a2722"
  },
  {
    id: "camera",
    label: "Camera",
    subtitle: "Visual memory",
    route: "#gallery",
    startPosition: [0.18, 4.05, 0.12],
    rotation: [0.2, -0.2, 0.2],
    scale: 0.86,
    accent: "#8fb8c8",
    body: "#1d2428"
  },
  {
    id: "skill",
    label: "Skill Tree",
    subtitle: "Growth map",
    route: "#world_tree",
    startPosition: [0.36, 4.5, -0.05],
    rotation: [0.35, 0.1, 0.44],
    scale: 0.84,
    accent: "#89b96f",
    body: "#31452c"
  },
  {
    id: "market",
    label: "Market",
    subtitle: "ETF notes / trading lab",
    route: "#finance",
    startPosition: [-0.08, 4.95, 0.18],
    rotation: [0.1, -0.35, -0.18],
    scale: 0.82,
    accent: "#477fe8",
    body: "#f6f0de"
  },
  {
    id: "world",
    label: "World",
    subtitle: "Playable island",
    route: "#modules",
    startPosition: [0.08, 5.45, -0.16],
    rotation: [0.28, 0.32, 0.16],
    scale: 0.8,
    accent: "#c0fe04",
    body: "#35352b"
  }
];
