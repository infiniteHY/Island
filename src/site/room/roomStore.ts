import { create } from "zustand";

export type RoomFocusId = "computer" | "console" | "vinyl" | "typewriter";

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
    label: "Console",
    subtitle: "BREAKOUT",
    hint: "← → 或鼠标移动挡板 · ESC 退出"
  },
  vinyl: {
    label: "Record Player",
    subtitle: "NOW SPINNING",
    hint: "点击唱片播放 / 暂停 · ESC 退出"
  },
  typewriter: {
    label: "Typewriter",
    subtitle: "LEAVE A MESSAGE",
    hint: "直接打字 · 寄出后我能收到 · ESC 退出"
  }
};
