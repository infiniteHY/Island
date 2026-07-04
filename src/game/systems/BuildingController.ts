import Phaser from "phaser";
import type { BuildingConfig, PolygonHotspot, RectHotspot, WorldMapConfig } from "../types/world";
import { GameEvent, gameEvents } from "../utils/eventBus";
import { useWorldStore } from "../../ui/worldStore";
import { BirdController } from "./BirdController";
import { EffectsManager } from "./EffectsManager";

export class BuildingController {
  private readonly hotspots: Phaser.GameObjects.Zone[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly map: WorldMapConfig,
    private readonly bird: BirdController,
    private readonly effects: EffectsManager
  ) {
    this.createHotspots();
  }

  openBuildingDirectly(building: BuildingConfig) {
    gameEvents.emit(GameEvent.BUILDING_ARRIVED, building);
  }

  private createHotspots() {
    for (const building of this.map.buildings) {
      const zone = this.createZone(building);
      zone.on("pointerover", () => this.effects.showHover(building));
      zone.on("pointerout", () => this.effects.hideHover(building));
      zone.on("pointerdown", () => this.handleBuildingClick(building));
      this.hotspots.push(zone);
    }
  }

  private handleBuildingClick(building: BuildingConfig) {
    const reducedMotion = useWorldStore.getState().reducedMotion;
    const accepted = this.bird.moveToBuilding(building, reducedMotion);
    if (accepted) gameEvents.emit(GameEvent.BUILDING_CLICKED, building);
  }

  private createZone(building: BuildingConfig) {
    const bounds = getHotspotBounds(building.hotspot);
    const zone = this.scene.add.zone(bounds.centerX, bounds.centerY, bounds.width, bounds.height);

    if (building.hotspot.type === "polygon") {
      const polygon = new Phaser.Geom.Polygon(
        building.hotspot.points.map(([x, y]) => new Phaser.Geom.Point(x - bounds.x, y - bounds.y))
      );
      zone.setInteractive(polygon, Phaser.Geom.Polygon.Contains);
    } else {
      zone.setInteractive();
    }

    zone.input!.cursor = "pointer";
    return zone;
  }
}

function getHotspotBounds(hotspot: PolygonHotspot | RectHotspot) {
  if (hotspot.type === "rect") {
    return {
      x: hotspot.x,
      y: hotspot.y,
      width: hotspot.width,
      height: hotspot.height,
      centerX: hotspot.x + hotspot.width / 2,
      centerY: hotspot.y + hotspot.height / 2
    };
  }

  const xs = hotspot.points.map(([x]) => x);
  const ys = hotspot.points.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const width = Math.max(...xs) - x;
  const height = Math.max(...ys) - y;

  return {
    x,
    y,
    width,
    height,
    centerX: x + width / 2,
    centerY: y + height / 2
  };
}
