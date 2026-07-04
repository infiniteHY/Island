import { useEffect, useRef, useState } from "react";

const ASCII_GLYPHS = "!<>-_\\/[]{}=+*^?#$%&@01";
const CJK_GLYPHS = "░▒▓█◆◇○●□■";

const prefersReduce = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isWide = (ch: string) => ch.charCodeAt(0) > 0x2e80;

const randomGlyph = (ch: string) => {
  const pool = isWide(ch) ? CJK_GLYPHS : ASCII_GLYPHS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const scrambled = (text: string) => text.replace(/\S/g, (ch) => randomGlyph(ch));

type Props = {
  text: string;
  /** 进入视口后再等待多少 ms 开始解码 */
  delay?: number;
  /** 每个字符解码所需 ms */
  step?: number;
  /** true = 只播一次;默认每次进入视口都重播 */
  once?: boolean;
  className?: string;
};

/** 乱码 → 逐字解码的文字入场;默认每次滑入视口都重新解码 */
export function Scramble({ text, delay = 0, step = 45, once = false, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() =>
    prefersReduce() ? text : scrambled(text)
  );
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (prefersReduce()) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setRunId((n) => n + 1);
          if (once) io.disconnect();
        } else if (!once) {
          setDisplay(scrambled(text)); // 离开视口→复位,等下次进入重播
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, text]);

  useEffect(() => {
    if (!runId || prefersReduce()) return;
    let raf = 0;
    const startAt = performance.now() + delay;

    const tick = (now: number) => {
      if (now < startAt) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const resolved = Math.floor((now - startAt) / step);
      if (resolved >= text.length) {
        setDisplay(text);
        return;
      }
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += i < resolved || ch === " " ? ch : randomGlyph(ch);
      }
      setDisplay(out);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [runId, text, delay, step]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
