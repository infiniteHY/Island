export type BottleItemId = "bass" | "earth" | "camera" | "bird" | "dumbbell" | "book";

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
  uiAccent: string;
  uiBody: string;
};

export const BOTTLE_ITEMS: BottleItemConfig[] = [
  {
    id: "bass",
    label: "Bass",
    subtitle: "Jazz bar / music theory",
    route: "#work",
    startPosition: [-0.22, 3.5, 0.06],
    rotation: [0.08, 0.2, -0.5],
    scale: 0.82,
    accent: "#d6a75d",
    body: "#15191e",
    uiAccent: "#b8ddbb",
    uiBody: "#88b98e"
  },
  {
    id: "book",
    label: "Book",
    subtitle: "Reading notes",
    route: "#work",
    startPosition: [-0.36, 3.82, -0.08],
    rotation: [0.18, -0.18, 0.32],
    scale: 1.02,
    accent: "#f4e3b0",
    body: "#6b2f35",
    uiAccent: "#f2b3ad",
    uiBody: "#d9867e"
  },
  {
    id: "earth",
    label: "Earth",
    subtitle: "Little blue planet",
    route: "#room",
    startPosition: [0.18, 4.05, 0.12],
    rotation: [0.2, -0.2, 0.2],
    scale: 0.88,
    accent: "#5fa8d3",
    body: "#274a68",
    uiAccent: "#cdbce2",
    uiBody: "#9f88bc"
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
    body: "#22262a",
    uiAccent: "#f0dc96",
    uiBody: "#d6bd68"
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
    body: "#3e423b",
    uiAccent: "#b6d1eb",
    uiBody: "#82aad0"
  },
  {
    id: "dumbbell",
    label: "Dumbbell",
    subtitle: "Training log",
    route: "#work",
    startPosition: [0.08, 5.45, -0.16],
    rotation: [0.4, 0.22, 0.36],
    scale: 0.88,
    accent: "#9aa3ad",
    body: "#25282d",
    uiAccent: "#f4c49a",
    uiBody: "#dea06e"
  }
];

const BOTTLE_NAV_ORDER: BottleItemId[] = ["book", "dumbbell", "camera", "bass", "bird", "earth"];

export const BOTTLE_NAV_ITEMS = BOTTLE_NAV_ORDER.map(
  (id) => BOTTLE_ITEMS.find((item) => item.id === id)!
);
