# 唱片机音频

把你喜欢的 mp3 拖进这个目录，然后在 `src/site/room/playlist.ts` 登记：

```ts
export const PLAYLIST: Track[] = [
  { title: "曲名", artist: "音乐人", src: "/audio/你的文件名.mp3" },
];
```

建议：

- 单曲 < 8MB（`preload="none"`，点击播放才加载，不影响首屏）
- 文件名用小写英文与连字符，例如 `blue-in-green.mp3`
- 仅使用你拥有版权或允许网络分发的音频
