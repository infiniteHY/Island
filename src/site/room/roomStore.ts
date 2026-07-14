import { create } from "zustand";

export type RoomFocusId = "computer" | "console" | "vinyl" | "typewriter" | "bookshelf" | "fridge" | "map" | "blackboard" | "porthole";

type RoomState = {
  focus: RoomFocusId | null;
  hovered: RoomFocusId | null;
  selectedBookId: string | null;
  /** 房间是否进入视口（离屏时暂停动画） */
  inView: boolean;
  setFocus: (id: RoomFocusId | null) => void;
  setHovered: (id: RoomFocusId | null) => void;
  openBook: (id: string) => void;
  closeBook: () => void;
  setInView: (value: boolean) => void;
};

export const useRoomStore = create<RoomState>((set) => ({
  focus: null,
  hovered: null,
  selectedBookId: null,
  inView: false,
  setFocus: (id) => set((state) => ({
    focus: id,
    hovered: null,
    selectedBookId: id === "bookshelf" ? state.selectedBookId : null
  })),
  setHovered: (id) => set({ hovered: id }),
  openBook: (id) => set({ focus: "bookshelf", hovered: null, selectedBookId: id }),
  closeBook: () => set({ selectedBookId: null }),
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
    hint: "第三层六本书可以打开真实读书笔记 · ESC 退出"
  },
  fridge: {
    label: "Fridge",
    subtitle: "MIDNIGHT SNACKS",
    hint: "冰箱门已打开：饮料和零食都在里面 · ESC 退出"
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
    subtitle: "XINJIANG NIGHT SKY",
    hint: "20240714 摄于新疆 · ESC 退出"
  }
};
