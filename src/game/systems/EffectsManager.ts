import Phaser from "phaser";
import type { BuildingConfig } from "../types/world";

// 文字位图渲染倍数 = 设备像素比 × 画布相对世界坐标的放大比例（上限 4，避免显存浪费）
function textResolution(scene: Phaser.Scene) {
  const dpr = window.devicePixelRatio || 1;
  const gameWidth = scene.scale.gameSize.width || 1;
  const screenWidth = scene.scale.displaySize.width || gameWidth; // 画布在屏幕上的实际像素宽度
  const upscale = screenWidth / gameWidth; // 画布相对世界坐标的放大倍数
  return Math.min(4, Math.max(2, dpr * upscale));
}

export class EffectsManager {
  private readonly labels = new Map<string, Phaser.GameObjects.Container>();

  constructor(private readonly scene: Phaser.Scene) {}

  createAmbientEffects() {
    const particles = this.scene.add.particles(0, 0, "world-back", {
      x: { min: 80, max: 1590 },
      y: { min: 50, max: 880 },
      lifespan: 3600,
      speedX: { min: -4, max: 4 },
      speedY: { min: -2, max: 2 },
      alpha: { start: 0.08, end: 0 },
      scale: { start: 0.004, end: 0.001 },
      frequency: 700,
      quantity: 1,
      blendMode: Phaser.BlendModes.ADD
    });
    particles.setDepth(5);
  }

  createPersistentLabels() {
    const labels = [
      { id: "world_tree", title: "世界树", x: 855, y: 185, width: 112 },
      { id: "library", title: "图书馆", x: 560, y: 270, width: 112 },
      { id: "workshop", title: "创意工坊", x: 585, y: 610, width: 142 },
      { id: "future", title: "待开发", x: 426, y: 795, width: 116 },
      { id: "sports", title: "体育馆", x: 390, y: 500, width: 112 },
      { id: "travel", title: "旅行航线", x: 1185, y: 115, width: 142 },
      { id: "finance", title: "金融交易所", x: 1215, y: 270, width: 158 },
      { id: "arcade", title: "游戏厅", x: 1195, y: 545, width: 112 },
      { id: "gallery", title: "展览馆", x: 1315, y: 680, width: 112 },
      { id: "jazz", title: "爵士乐酒吧", x: 1046, y: 742, width: 158 }
    ];

    for (const label of labels) {
      const container = this.scene.add.container(label.x, label.y);
      const bubble = this.scene.add.graphics();
      bubble.fillStyle(0x143d43, 0.78);
      bubble.fillRoundedRect(-label.width / 2, -24, label.width, 48, 10);
      bubble.lineStyle(1, 0xfff4c7, 0.72);
      bubble.strokeRoundedRect(-label.width / 2, -24, label.width, 48, 10);

      const text = this.scene.add
        .text(0, 0, label.title, {
          color: "#fff7d2",
          fontFamily: "Arial, 'Microsoft YaHei', sans-serif",
          fontSize: "26px",
          fontStyle: "bold",
          stroke: "#12383d",
          strokeThickness: 3
        })
        .setOrigin(0.5);
      // 按设备像素比 + 画布放大倍数渲染文字位图，保证缩放后依旧清晰
      text.setResolution(textResolution(this.scene));

      container.add([bubble, text]);
      container.setDepth(1800);
      container.setAlpha(0.96);
      this.labels.set(label.id, container);
    }
  }

  showHover(building: BuildingConfig) {
    const label = this.labels.get(building.id);
    if (!label) return;

    // 鼠标移上时标题放大并提亮，给出可点击的视觉反馈
    this.scene.tweens.add({
      targets: label,
      scale: 1.28,
      alpha: 1,
      duration: 150,
      ease: "Back.easeOut"
    });
    label.setDepth(2000);
  }

  hideHover(building: BuildingConfig) {
    const label = this.labels.get(building.id);
    if (!label) return;

    this.scene.tweens.add({
      targets: label,
      scale: 1,
      alpha: 0.96,
      duration: 150,
      ease: "Sine.easeOut"
    });
    label.setDepth(1800);
  }
}
