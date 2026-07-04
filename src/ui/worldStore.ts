import { create } from "zustand";
import type { BuildingConfig, BuildingId, NodeId } from "../game/types/world";

type WorldStore = {
  selectedBuildingId: BuildingId | null;
  activeBuilding: BuildingConfig | null;
  isBirdMoving: boolean;
  currentNodeId: NodeId;
  preloadProgress: number;
  reducedMotion: boolean;
  openBuilding: (building: BuildingConfig) => void;
  closeBuilding: () => void;
  setBirdMoving: (moving: boolean) => void;
  setCurrentNodeId: (nodeId: NodeId) => void;
  setPreloadProgress: (value: number) => void;
  setReducedMotion: (value: boolean) => void;
};

export const useWorldStore = create<WorldStore>((set) => ({
  selectedBuildingId: null,
  activeBuilding: null,
  isBirdMoving: false,
  currentNodeId: "center",
  preloadProgress: 0,
  reducedMotion: false,
  openBuilding: (building) =>
    set({
      selectedBuildingId: building.id,
      activeBuilding: building
    }),
  closeBuilding: () =>
    set({
      selectedBuildingId: null,
      activeBuilding: null
    }),
  setBirdMoving: (moving) => set({ isBirdMoving: moving }),
  setCurrentNodeId: (nodeId) => set({ currentNodeId: nodeId }),
  setPreloadProgress: (value) => set({ preloadProgress: value }),
  setReducedMotion: (value) => set({ reducedMotion: value })
}));
