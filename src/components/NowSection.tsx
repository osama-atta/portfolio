"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { nowItems, type NowItem } from "@/data/content";
import { Digit, toDigits } from "./SevenSegment";
import { SectionHeading } from "./SectionHeading";
import { PoweredSection } from "./circuit/PoweredSection";
import { usePower } from "./circuit/SpineProvider";

const POWER_INDEX = 2;
const CHANNEL_MS = 300; // gap between one channel starting up and the next
const FIRST_MS = 200; // delay before the first channel starts
const COUNT_MS = 1000; // how long a counter takes to climb to its value

/*
  The current month as a single number (year * 12 + month index). It's read
  in the browser, so the counters are always up to date; during the static
  build there's no "today", so the counters render as dashes until the page loads.
*/
const noSubscribe = () => () => {};
const monthNow = () => {
  const d = new Date();
  return d.getFullYear() * 12 + d.getMonth();
};

function counterTarget(item: NowItem, now: number | null): number | null {
  if (!item.counter || now === null) return null;
  const target = item.counter.year * 12 + (item.counter.month - 1);
  const months = item.counter.kind === "since" ? now - target : target - now;
  return Math.max(0, months);
}

/**
 * "What I'm working on now": four live channels. When the section gets power
 * they start up one by one, their counters climb to today's value, and their
 * activity LEDs keep blinking.
 */
export function NowSection() {
  const { on, reduced } = usePower(POWER_INDEX);
  const now = useSyncExternalStore(noSubscribe, monthNow, () => null);
  const [upCount, setUpCount] = useState(0);
  // Per-channel counter progress: 0 = not started, 0…1 = climbing, 1 = done.
  const [progress, setProgress] = useState<number[]>(() => nowItems.map(() => 0));
  const frameRef = useRef(0);

  useEffect(() => {
    if (reduced) return;
    if (!on) {
      // Current dropped back above the section: switch the channels off and zero the counters.
      cancelAnimationFrame(frameRef.current);
      const reset = setTimeout(() => {
        setUpCount(0);
        setProgress(nowItems.map(() => 0));
      }, 0);
      return () => clearTimeout(reset);
    }
    const timers = nowItems.map((_, i) => setTimeout(() => setUpCount((n) => Math.max(n, i + 1)), FIRST_MS + i * CHANNEL_MS));

    // Each counter starts climbing when its channel comes up.
    const total = FIRST_MS + (nowItems.length - 1) * CHANNEL_MS + COUNT_MS;
    let start: number | null = null;
    const step = (t: number) => {
      start ??= t;
      const elapsed = t - start;
      setProgress(nowItems.map((_, i) => Math.max(0, Math.min(1, (elapsed - FIRST_MS - i * CHANNEL_MS) / COUNT_MS))));
      if (elapsed < total) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [on, reduced]);

  const up = reduced ? nowItems.length : on ? upCount : 0;

  return (
    <PoweredSection index={POWER_INDEX} id="now" className="flex flex-col gap-[22px]">
      <SectionHeading eyebrow="A2 · Status monitor" title="What I'm working on now" badgeFor={POWER_INDEX} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-4">
        {nowItems.map((item, i) => {
          const live = i < up;
          const target = counterTarget(item, now);
          const p = reduced ? 1 : progress[i];
          const eased = 1 - Math.pow(1 - p, 3); // ease-out, like the test points
          const value = target === null ? "--" : String(Math.round(target * eased));
          const finalValue = target === null ? "--" : String(target);
          return (
            <article
              key={item.id}
              className={`flex flex-col gap-3 rounded-xl border bg-panel p-5 transition-[border-color,box-shadow,opacity] duration-300 ${
                live ? "border-copper/70 shadow-[0_0_18px_-8px_var(--color-copper)]" : "border-line opacity-60"
              }`}
            >
              <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[12px] tracking-[0.06em]">
                <span className={live ? "text-copper" : "text-dim"}>
                  CH{i + 1} · {item.channel.toUpperCase()}
                </span>
                <span className={`inline-flex items-center gap-1.5 ${live ? "text-ink" : "text-dim"}`}>
                  {/* Activity LED: blinks while the channel is live (steady if the visitor prefers less motion). */}
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${
                      live ? "bg-led shadow-[0_0_8px_var(--color-led)] motion-safe:animate-[activity_1.6s_ease-in-out_infinite]" : "bg-line-strong"
                    }`}
                    style={{ animationDelay: `${i * 250}ms` }}
                  />
                  {live ? item.status : "STANDBY"}
                </span>
              </header>

              <h3 className="m-0 font-display text-[22px] font-bold leading-tight">{item.title}</h3>
              <p className="m-0 text-[15px] leading-relaxed text-muted">{item.detail}</p>

              <div className="mt-auto flex flex-col gap-3 pt-1">
                {item.counter && (
                  <div className="flex items-end justify-between gap-3 rounded-lg border border-line bg-[#050605] px-3.5 py-3">
                    <span aria-hidden="true" className={`flex items-end gap-1 ${live ? "drop-shadow-[0_0_6px_var(--led-glow)]" : ""}`}>
                      {toDigits(value.padStart(2, " ")).map((d, j) => (
                        <Digit key={j} char={d.char} point={d.point} dim={!live} />
                      ))}
                    </span>
                    <span className="pb-1 text-right font-mono text-[11px] leading-snug tracking-[0.08em] text-muted">
                      {item.counter.label}
                    </span>
                    <span className="sr-only">
                      {finalValue} {item.counter.label.toLowerCase()}
                    </span>
                  </div>
                )}
                {item.tags && (
                  <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {item.tags.map((t) => (
                      <li key={t} className={`rounded px-2 py-1 font-mono text-[12px] ${live ? "bg-copper/15 text-copper" : "bg-pad text-dim"}`}>
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                {item.link && (
                  <a href={item.link.href} className="self-start py-1 text-[15px] font-semibold text-copper no-underline hover:underline">
                    {item.link.label}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </PoweredSection>
  );
}
