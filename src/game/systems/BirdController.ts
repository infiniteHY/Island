import Phaser from "phaser";
import type { BuildingConfig, NodeId, WorldNode } from "../types/world";
import { GameEvent, gameEvents } from "../utils/eventBus";
import { PathGraph } from "./PathGraph";

export class BirdController {
  private readonly bird: Phaser.GameObjects.Container;
  private readonly avatar: Phaser.GameObjects.Image;
  private readonly avatarSilhouette: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private currentNodeId: NodeId;
  private moving = false;
  private bobTime = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly graph: PathGraph,
    startNodeId: NodeId
  ) {
    const start = this.graph.getNode(startNodeId);
    this.currentNodeId = startNodeId;

    this.shadow = scene.add.ellipse(0, 8, 54, 16, 0x0f5960, 0.24);
    this.avatarSilhouette = scene.add.image(3, 3, "bird-stay");
    this.avatarSilhouette.setOrigin(0.5, 1);
    this.avatarSilhouette.setScale(0.058);
    this.avatarSilhouette.setTint(0x0d4a52);
    this.avatarSilhouette.setAlpha(0.26);
    this.avatar = scene.add.image(0, 0, "bird-stay");
    this.avatar.setOrigin(0.5, 1);
    this.avatar.setScale(0.056);

    this.bird = scene.add.container(start.x, start.y, [this.shadow, this.avatarSilhouette, this.avatar]);
    this.bird.setDepth(start.y + 20);
  }

  get isMoving() {
    return this.moving;
  }

  getCurrentNodeId() {
    return this.currentNodeId;
  }

  moveToBuilding(building: BuildingConfig, reducedMotion: boolean) {
    if (this.moving) return false;

    const path = this.graph.findPath(this.currentNodeId, building.targetNodeId);
    this.followPath(path, building, reducedMotion);
    return true;
  }

  update(_time: number, delta: number) {
    this.bobTime += delta;
    if (!this.moving) {
      const bob = Math.sin(this.bobTime / 420) * 1.6;
      this.avatar.y = bob;
      this.avatarSilhouette.y = 3 + bob;
    }
    this.bird.setDepth(this.bird.y + 20);
  }

  private followPath(path: WorldNode[], building: BuildingConfig, reducedMotion: boolean) {
    if (path.length === 0) return;

    this.moving = true;
    gameEvents.emit(GameEvent.BIRD_MOVE_START, building);

    // 沿街道逐段行走：恒定步速，让长短路线都保持自然的行走节奏；
    // 在每个转角短暂停顿并转身，模拟真实的拐弯行为。
    const walkSpeed = reducedMotion ? 0.62 : 0.26; // 像素 -> 毫秒
    const segments = path.slice(1);
    const lastIndex = segments.length - 1;

    const tweens = segments.map((node, index) => {
      const isLast = index === lastIndex;
      const prev = path[index]; // 当前段的起点节点
      const distance = Phaser.Math.Distance.Between(prev.x, prev.y, node.x, node.y);
      return {
        x: node.x,
        y: node.y,
        duration: Math.max(reducedMotion ? 110 : 220, distance * walkSpeed),
        // 起步轻微加速、抵达终点轻微减速，中途匀速行走
        ease: index === 0 ? "Sine.easeIn" : isLast ? "Sine.easeOut" : "Linear",
        // 到达转角后短暂停顿，准备转向下一段
        hold: isLast ? 0 : reducedMotion ? 0 : 90,
        onStart: () => {
          this.applyDirectionTexture(node);
        },
        onUpdate: () => {
          // 步频随行走起伏，越走越有节奏感
          const bob = Math.abs(Math.sin(this.scene.time.now / 90)) * -5;
          this.avatar.y = bob;
          this.avatarSilhouette.y = 3 + bob;
        }
      };
    });

    this.scene.tweens.chain({
      targets: this.bird,
      tweens,
      onComplete: () => {
        this.currentNodeId = building.targetNodeId;
        this.moving = false;
        this.avatar.setTexture("bird-stay");
        this.avatarSilhouette.setTexture("bird-stay");
        this.avatar.setFlipX(false);
        this.avatarSilhouette.setFlipX(false);
        this.avatar.y = 0;
        this.avatarSilhouette.y = 3;
        gameEvents.emit(GameEvent.BIRD_MOVE_END, building);
        gameEvents.emit(GameEvent.BUILDING_ARRIVED, building);
      }
    });
  }

  private applyDirectionTexture(nextNode: WorldNode) {
    const dx = nextNode.x - this.bird.x;
    const dy = nextNode.y - this.bird.y;
    const horizontal = Math.abs(dx) > Math.abs(dy) * 0.8;
    const movingDown = dy > 0;
    const texture = horizontal ? "bird-side" : movingDown ? "bird-front" : "bird-walk";
    const flipX = horizontal ? dx < 0 : false;

    this.avatar.setTexture(texture);
    this.avatarSilhouette.setTexture(texture);
    this.avatar.setFlipX(flipX);
    this.avatarSilhouette.setFlipX(flipX);
  }
}
