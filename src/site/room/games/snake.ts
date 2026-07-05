/**
 * 贪吃蛇 —— 纯逻辑层，可单测。
 * 渲染层负责 canvas 绑定与键盘事件转发。
 */

export type Vec = { x: number; y: number };
export type SnakeStatus = "ready" | "running" | "over";

export type SnakeState = {
  cols: number;
  rows: number;
  snake: Vec[];
  dir: Vec;
  pendingDir: Vec | null;
  food: Vec;
  score: number;
  status: SnakeStatus;
  /** 每步毫秒，随得分加速 */
  stepMs: number;
};

const BASE_STEP_MS = 160;
const MIN_STEP_MS = 70;

export function createSnake(cols = 20, rows = 14, random: () => number = Math.random): SnakeState {
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  const snake = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy }
  ];
  const state: SnakeState = {
    cols,
    rows,
    snake,
    dir: { x: 1, y: 0 },
    pendingDir: null,
    food: { x: 0, y: 0 },
    score: 0,
    status: "ready",
    stepMs: BASE_STEP_MS
  };
  state.food = spawnFood(state, random);
  return state;
}

export function spawnFood(state: SnakeState, random: () => number = Math.random): Vec {
  const occupied = new Set(state.snake.map((s) => `${s.x},${s.y}`));
  const free: Vec[] = [];
  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.cols; x += 1) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return { x: -1, y: -1 };
  return free[Math.floor(random() * free.length)];
}

/** 转向：忽略反向与斜向 */
export function turnSnake(state: SnakeState, dir: Vec) {
  if (Math.abs(dir.x) + Math.abs(dir.y) !== 1) return;
  const current = state.pendingDir ?? state.dir;
  if (current.x + dir.x === 0 && current.y + dir.y === 0) return;
  state.pendingDir = dir;
  if (state.status === "ready") state.status = "running";
}

/** 前进一步；返回事件用于渲染层播放反馈 */
export function stepSnake(state: SnakeState, random: () => number = Math.random): "moved" | "ate" | "died" | "idle" {
  if (state.status !== "running") return "idle";

  if (state.pendingDir) {
    state.dir = state.pendingDir;
    state.pendingDir = null;
  }

  const head = state.snake[0];
  const next = { x: head.x + state.dir.x, y: head.y + state.dir.y };

  const hitWall = next.x < 0 || next.y < 0 || next.x >= state.cols || next.y >= state.rows;
  const hitSelf = state.snake.some((s, i) => i < state.snake.length - 1 && s.x === next.x && s.y === next.y);
  if (hitWall || hitSelf) {
    state.status = "over";
    return "died";
  }

  state.snake.unshift(next);
  if (next.x === state.food.x && next.y === state.food.y) {
    state.score += 10;
    state.stepMs = Math.max(MIN_STEP_MS, BASE_STEP_MS - state.score * 1.6);
    state.food = spawnFood(state, random);
    return "ate";
  }
  state.snake.pop();
  return "moved";
}
