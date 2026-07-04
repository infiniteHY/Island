import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { WorldScene } from "./scenes/WorldScene";

export const WORLD_WIDTH = 1672;
export const WORLD_HEIGHT = 941;

export function createPhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    backgroundColor: "#67bcc0",
    scene: [BootScene, PreloadScene, WorldScene],
    scale: {
      // ENVELOP 让背景图始终铺满整个视口（覆盖式缩放，随浏览器尺寸/缩放动态变化）
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false
    },
    input: {
      activePointers: 3
    }
  };
}
