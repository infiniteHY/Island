import Phaser from "phaser";
import { GameEvent, gameEvents } from "../utils/eventBus";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.on("progress", (value: number) => {
      gameEvents.emit(GameEvent.PRELOAD_PROGRESS, value);
    });

    this.load.image("world-back", "/assets/world/back.png");
    this.load.image("world-buildings", "/assets/world/buildings.png");
    this.load.image("bird-front", "/assets/bird/bird-front.png");
    this.load.image("bird-side", "/assets/bird/bird-side.png");
    this.load.image("bird-stay", "/assets/bird/bird-stay.png");
    this.load.image("bird-walk", "/assets/bird/bird-walk.png");
  }

  create() {
    gameEvents.emit(GameEvent.PRELOAD_PROGRESS, 1);
    this.scene.start("WorldScene");
  }
}
