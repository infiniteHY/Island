import Phaser from "phaser";

export const gameEvents = new Phaser.Events.EventEmitter();

export const GameEvent = {
  BUILDING_CLICKED: "building:clicked",
  BUILDING_ARRIVED: "building:arrived",
  BIRD_MOVE_START: "bird:move_start",
  BIRD_MOVE_END: "bird:move_end",
  PRELOAD_PROGRESS: "preload:progress"
} as const;
