import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import type { BuildingConfig } from "../game/types/world";
import { GameEvent, gameEvents } from "../game/utils/eventBus";
import { BuildingPanel } from "./BuildingPanel";
import { LoadingScreen } from "./LoadingScreen";
import { TopBar } from "./TopBar";
import { useWorldStore } from "./worldStore";

export function WorldOverlay() {
  const activeBuilding = useWorldStore((state) => state.activeBuilding);
  const closeBuilding = useWorldStore((state) => state.closeBuilding);
  const openBuilding = useWorldStore((state) => state.openBuilding);
  const preloadProgress = useWorldStore((state) => state.preloadProgress);
  const setBirdMoving = useWorldStore((state) => state.setBirdMoving);
  const setCurrentNodeId = useWorldStore((state) => state.setCurrentNodeId);
  const setPreloadProgress = useWorldStore((state) => state.setPreloadProgress);

  useEffect(() => {
    const onArrived = (building: BuildingConfig) => {
      openBuilding(building);
      setCurrentNodeId(building.targetNodeId);
      window.history.replaceState(null, "", `#${building.id}`);
    };
    const onMoveStart = () => setBirdMoving(true);
    const onMoveEnd = () => setBirdMoving(false);
    const onProgress = (value: number) => setPreloadProgress(value);

    gameEvents.on(GameEvent.BUILDING_ARRIVED, onArrived);
    gameEvents.on(GameEvent.BIRD_MOVE_START, onMoveStart);
    gameEvents.on(GameEvent.BIRD_MOVE_END, onMoveEnd);
    gameEvents.on(GameEvent.PRELOAD_PROGRESS, onProgress);

    return () => {
      gameEvents.off(GameEvent.BUILDING_ARRIVED, onArrived);
      gameEvents.off(GameEvent.BIRD_MOVE_START, onMoveStart);
      gameEvents.off(GameEvent.BIRD_MOVE_END, onMoveEnd);
      gameEvents.off(GameEvent.PRELOAD_PROGRESS, onProgress);
    };
  }, [openBuilding, setBirdMoving, setCurrentNodeId, setPreloadProgress]);

  const handleClose = () => {
    closeBuilding();
    window.history.replaceState(null, "", window.location.pathname);
  };

  return (
    <div className="world-overlay">
      <TopBar />
      <AnimatePresence>{preloadProgress < 1 ? <LoadingScreen progress={preloadProgress} /> : null}</AnimatePresence>
      <AnimatePresence>
        {activeBuilding ? <BuildingPanel building={activeBuilding} onClose={handleClose} /> : null}
      </AnimatePresence>
    </div>
  );
}
