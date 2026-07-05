export type Track = {
  title: string;
  artist: string;
  src: string;
};

/**
 * 唱片机播放列表。
 * 把 mp3 放进 public/audio/ 后在这里登记即可（见 public/audio/README.md）。
 */
export const PLAYLIST: Track[] = [
  { title: "Side A · 占位曲目 1", artist: "put mp3 in /public/audio", src: "/audio/track-01.mp3" },
  { title: "Side A · 占位曲目 2", artist: "put mp3 in /public/audio", src: "/audio/track-02.mp3" },
  { title: "Side B · 占位曲目 3", artist: "put mp3 in /public/audio", src: "/audio/track-03.mp3" }
];
