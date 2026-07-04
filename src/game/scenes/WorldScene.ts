import Phaser from "phaser";
import worldMap from "../data/world-map.json";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../config";
import { BirdController } from "../systems/BirdController";
import { BuildingController } from "../systems/BuildingController";
import { DepthSortSystem } from "../systems/DepthSortSystem";
import { EffectsManager } from "../systems/EffectsManager";
import { PathGraph } from "../systems/PathGraph";
import type { WorldMapConfig } from "../types/world";

export class WorldScene extends Phaser.Scene {
  private bird!: BirdController;
  private buildings!: BuildingController;
  private depthSort!: DepthSortSystem;
  private effects!: EffectsManager;
  private graph!: PathGraph;

  constructor() {
    super("WorldScene");
  }

  create() {
    const map = worldMap as WorldMapConfig;

    this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, "world-back").setDepth(0);

    this.graph = new PathGraph(map);
    this.effects = new EffectsManager(this);
    this.bird = new BirdController(this, this.graph, map.startNodeId);
    this.buildings = new BuildingController(this, map, this.bird, this.effects);
    this.depthSort = new DepthSortSystem(this);

    this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, "world-buildings").setDepth(100);
    this.effects.createAmbientEffects();
    this.effects.createPersistentLabels();

    const initialHash = window.location.hash.replace("#", "");
    const initialBuilding = map.buildings.find((building) => building.id === initialHash);
    if (initialBuilding) {
      this.time.delayedCall(250, () => {
        this.buildings.openBuildingDirectly(initialBuilding);
      });
    }
  }

  update(time: number, delta: number) {
    this.bird.update(time, delta);
    this.depthSort.update();
  }
}
