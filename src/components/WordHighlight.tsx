"use client";

import { useEffect, useRef, useState } from "react";

/** Statement moment: the line rests at half ink and turns to ink word by word as it
 *  crosses the middle of the screen; one strong word takes the accent. Reverses on the way up. */
export function WordHighlight({ text, strong }: { text: string; strong: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [lit, setLit] = useState(0);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLit(words.length);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the block's top reaches 75% of the screen, 1 when its bottom reaches 40%.
      const start = vh * 0.75;
      const end = vh * 0.4;
      const p = (start - r.top) / (start - end + r.height);
      setLit(Math.round(Math.min(1, Math.max(0, p)) * words.length));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [words.length]);

  return (
    <p ref={ref} className="text-[clamp(1.75rem,1rem+3vw,3.5rem)] font-medium leading-[1.35]">
      {words.map((w, i) => {
        const on = i < lit;
        const isStrong = w.replace(/[،,.]/g, "") === strong;
        return (
          <span
            key={i}
            className="transition-colors duration-300"
            style={{ color: on ? (isStrong ? "var(--accent)" : "var(--ink)") : "rgb(14 27 42 / 0.32)" }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
