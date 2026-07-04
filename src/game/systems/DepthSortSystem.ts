import Phaser from "phaser";

export class DepthSortSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  update() {
    this.scene.children.each((child) => {
      if ("depth" in child) return true;
      return true;
    });
  }
}
