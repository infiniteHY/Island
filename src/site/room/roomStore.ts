import { create } from "zustand";

export type RoomFocusId = "computer" | "console" | "vinyl" | "typewriter" | "bookshelf" | "map" | "blackboard" | "porthole";

type RoomState = {
  focus: RoomFocusId | null;
  hovered: RoomFocusId | null;
  /** 房间是否进入视口（离屏时暂停动画） */
  inView: boolean;
  setFocus: (id: RoomFocusId | null) => void;
  setHovered: (id: RoomFocusId | null) => void;
  setInView: (value: boolean) => void;
};

export const useRoomStore = create<RoomState>((set) => ({
  focus: null,
  hovered: null,
  inView: false,
  setFocus: (id) => set({ focus: id, hovered: null }),
  setHovered: (id) => set({ hovered: id }),
  setInView: (value) => set({ inView: value })
}));

export const ROOM_OBJECT_META: Record<RoomFocusId, { label: string; subtitle: string; hint: string }> = {
  computer: {
    label: "Computer",
    subtitle: "SNAKE.EXE",
    hint: "方向键 / WASD 移动 · ESC 退出"
  },
  console: {
    label: "Switch",
    subtitle: "BREAKOUT",
    hint: "← → / A D 或鼠标移挡板 · ESC 退出"
  },
  vinyl: {
    label: "Record Player",
    subtitle: "NOW SPINNING",
    hint: "START 播放 · STOP 停止 · ESC 退出"
  },
  typewriter: {
    label: "Typewriter",
    subtitle: "LEAVE A MESSAGE",
    hint: "直接打字 · 寄出后我能收到 · ESC 退出"
  },
  bookshelf: {
    label: "Bookshelf",
    subtitle: "MY NOTES",
    hint: "这里放我读过的书和笔记 · ESC 退出"
  },
  map: {
    label: "World Map",
    subtitle: "PLACES & DREAMS",
    hint: "记录我旅行过的国家 · ESC 退出"
  },
  blackboard: {
    label: "Blackboard",
    subtitle: "VISION BOARD",
    hint: "未来的愿景板 · ESC 退出"
  },
  porthole: {
    label: "Porthole",
    subtitle: "THE MILKY WAY",
    hint: "舷窗外的真实银河（ESO 全景摄影） · ESC 退出"
  }
};
