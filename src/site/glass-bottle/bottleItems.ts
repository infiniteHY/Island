export type BottleItemId = "bass" | "earth" | "camera" | "bird" | "market";

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
    route: "#work",
    startPosition: [-0.22, 3.5, 0.06],
    rotation: [0.1, 0.25, -0.38],
    scale: 0.94,
    accent: "#d6a75d",
    body: "#3a2b20"
  },
  {
    id: "earth",
    label: "Earth",
    subtitle: "Places / little world",
    route: "#room",
    startPosition: [0.18, 4.05, 0.12],
    rotation: [0.2, -0.2, 0.2],
    scale: 0.88,
    accent: "#5fa8d3",
    body: "#274a68"
  },
  {
    id: "camera",
    label: "Camera",
    subtitle: "Visual memory",
    route: "#work",
    startPosition: [0.36, 4.5, -0.05],
    rotation: [0.35, 0.1, 0.44],
    scale: 0.86,
    accent: "#c9cdd1",
    body: "#22262a"
  },
  {
    id: "bird",
    label: "Birding",
    subtitle: "Field notes",
    route: "#room",
    startPosition: [-0.08, 4.95, 0.18],
    rotation: [0.1, -0.35, -0.18],
    scale: 0.84,
    accent: "#c0fe04",
    body: "#3e423b"
  },
  {
    id: "market",
    label: "Market",
    subtitle: "ETF notes / trading lab",
    route: "#work",
    startPosition: [0.08, 5.45, -0.16],
    rotation: [0.28, 0.32, 0.16],
    scale: 0.82,
    accent: "#477fe8",
    body: "#141a22"
  }
];
