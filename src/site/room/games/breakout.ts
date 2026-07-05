/**
 * 打砖块 —— 纯逻辑层，可单测。
 * 坐标系：宽 1 高 1 的归一化空间，渲染层按 canvas 尺寸缩放。
 */

export type BreakoutStatus = "ready" | "running" | "cleared" | "over";

export type Brick = { x: number; y: number; w: number; h: number; hp: number };

export type BreakoutState = {
  paddleX: number; // 挡板中心 (0..1)
  paddleW: number;
  ball: { x: number; y: number; vx: number; vy: number };
  bricks: Brick[];
  score: number;
  lives: number;
  level: number;
  status: BreakoutStatus;
};

const PADDLE_W = 0.22;
const PADDLE_Y = 0.94;
const BALL_SPEED = 0.62; // 每秒（归一化）

export function createBreakout(level = 1): BreakoutState {
  return {
    paddleX: 0.5,
    paddleW: PADDLE_W,
    ball: resetBall(level),
    bricks: buildBricks(level),
    score: 0,
    lives: 3,
    level,
    status: "ready"
  };
}

function resetBall(level: number) {
  const speed = BALL_SPEED * (1 + (level - 1) * 0.15);
  const angle = (-Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1) - Math.PI / 4;
  return { x: 0.5, y: 0.62, vx: Math.cos(angle) * speed, vy: -Math.abs(Math.sin(angle) * speed) };
}

export function buildBricks(level: number): Brick[] {
  const cols = 6;
  const rows = 5;
  const gap = 0.012;
  const w = (1 - gap * (cols + 1)) / cols;
  const h = 0.045;
  const bricks: Brick[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      bricks.push({
        x: gap + c * (w + gap),
        y: 0.08 + r * (h + gap),
        w,
        h,
        hp: r < 2 ? Math.min(2, level) : 1
      });
    }
  }
  return bricks;
}

export function movePaddle(state: BreakoutState, x: number) {
  const half = state.paddleW / 2;
  state.paddleX = Math.min(1 - half, Math.max(half, x));
  if (state.status === "ready") state.status = "running";
}

export function launchBreakout(state: BreakoutState) {
  if (state.status === "ready") state.status = "running";
}

/** 推进 dt 秒；返回事件供渲染层反馈 */
export function stepBreakout(state: BreakoutState, dt: number): "idle" | "moved" | "hit" | "lost-life" | "over" | "cleared" {
  if (state.status !== "running") return "idle";

  const ball = state.ball;
  const r = 0.014; // 球半径
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // 墙
  if (ball.x < r) {
    ball.x = r;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x > 1 - r) {
    ball.x = 1 - r;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y < r) {
    ball.y = r;
    ball.vy = Math.abs(ball.vy);
  }

  let event: "moved" | "hit" | "lost-life" | "over" | "cleared" = "moved";

  // 挡板
  const half = state.paddleW / 2;
  if (ball.vy > 0 && ball.y > PADDLE_Y - r && ball.y < PADDLE_Y + 0.03 && Math.abs(ball.x - state.paddleX) < half + r) {
    ball.vy = -Math.abs(ball.vy);
    // 根据击中位置改变水平角度
    const offset = (ball.x - state.paddleX) / half;
    const speed = Math.hypot(ball.vx, ball.vy);
    const angle = -Math.PI / 2 + offset * (Math.PI / 3.2);
    ball.vx = Math.sin(angle + Math.PI / 2) * speed * Math.sign(offset || ball.vx || 1);
    ball.vx = offset * speed * 0.85;
    ball.vy = -Math.sqrt(Math.max(speed * speed - ball.vx * ball.vx, 0.05));
    event = "hit";
  }

  // 砖块
  for (const brick of state.bricks) {
    if (brick.hp <= 0) continue;
    if (ball.x > brick.x - r && ball.x < brick.x + brick.w + r && ball.y > brick.y - r && ball.y < brick.y + brick.h + r) {
      brick.hp -= 1;
      state.score += 20;
      // 简化反弹：比较进入深度决定翻转轴
      const overlapX = Math.min(ball.x - (brick.x - r), brick.x + brick.w + r - ball.x);
      const overlapY = Math.min(ball.y - (brick.y - r), brick.y + brick.h + r - ball.y);
      if (overlapX < overlapY) ball.vx = -ball.vx;
      else ball.vy = -ball.vy;
      event = "hit";
      break;
    }
  }

  if (state.bricks.every((b) => b.hp <= 0)) {
    state.status = "cleared";
    return "cleared";
  }

  // 掉落
  if (ball.y > 1 + r * 2) {
    state.lives -= 1;
    if (state.lives <= 0) {
      state.status = "over";
      return "over";
    }
    state.ball = resetBall(state.level);
    state.status = "ready";
    return "lost-life";
  }

  return event;
}

/** 通关进入下一关（保留分数与命） */
export function nextLevel(state: BreakoutState): BreakoutState {
  const level = state.level + 1;
  return {
    ...createBreakout(level),
    score: state.score,
    lives: state.lives,
    level
  };
}
