"use client";

import { useEffect, useState } from "react";

/*
  The start-up screen. On a visitor's first load in a browser session, the
  board "boots": a POST-style log types out under the chip while a progress
  bar fills, then the screen fades and the spine starts carrying current
  (see SpineProvider, which waits for the "oa:boot" event).

  - It's in the static HTML, so it covers the page from the first paint.
  - Any key, click, tap or scroll skips it.
  - It only plays once per session: an inline script in layout.tsx adds the
    "booted" class to <html> on later loads, and CSS hides it straight away.
  - It never shows for visitors who prefer reduced motion, or without JavaScript.
*/

export const BOOT_EVENT = "oa:boot";
const SESSION_KEY = "oa-booted";

const LINES: [label: string, status: string][] = [
  ["POST", "OK"],
  ["MEM CHECK · 5 YRS EXPERIENCE", "OK"],
  ["LOAD java.spring", "OK"],
  ["LOAD typescript.angular", "OK"],
  ["LOAD ai.toolchain", "OK"],
  ["GPS LOCK · OMAHA, NE", "OK"],
  ["TZ · CENTRAL TIME", "OK"],
  ["RAIL 3V3", "STABLE"],
];
const LINE_MS = 210; // between log lines
const FIRST_MS = 350; // before the first line
const READY_MS = 450; // "READY" stays up this long before the fade
const FADE_MS = 550;

type Phase = "running" | "ready" | "fading" | "gone";

declare global {
  interface Window {
    __oaBooted?: boolean;
  }
}

/** Tell the rest of the page that boot is over (the spine starts powering up). */
function announceBooted() {
  window.__oaBooted = true;
  window.dispatchEvent(new Event(BOOT_EVENT));
  document.documentElement.classList.add("booted");
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Private mode or blocked storage: the boot screen just plays again next time.
  }
}

export function BootScreen() {
  const [shown, setShown] = useState(0); // log lines visible
  const [phase, setPhase] = useState<Phase>("running");

  useEffect(() => {
    const html = document.documentElement;
    const skipEntirely = html.classList.contains("booted") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    if (skipEntirely) {
      later(() => {
        setPhase("gone");
        announceBooted();
      }, 0);
      return () => timers.forEach(clearTimeout);
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      setShown(LINES.length);
      setPhase("fading");
      announceBooted();
      later(() => setPhase("gone"), FADE_MS);
    };

    LINES.forEach((_, i) => later(() => setShown(i + 1), FIRST_MS + i * LINE_MS));
    const readyAt = FIRST_MS + LINES.length * LINE_MS;
    later(() => setPhase("ready"), readyAt);
    later(finish, readyAt + READY_MS);

    const skipKeys = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault(); // so Space or an arrow key skips without also scrolling the page
      finish();
    };
    window.addEventListener("keydown", skipKeys);
    window.addEventListener("pointerdown", finish);
    window.addEventListener("wheel", finish, { passive: true });
    window.addEventListener("touchmove", finish, { passive: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skipKeys);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchmove", finish);
    };
  }, []);

  if (phase === "gone") return null;

  const progress = phase === "running" ? shown / (LINES.length + 1) : 1;

  return (
    <div
      id="boot"
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-board px-6 font-mono transition-opacity ease-out"
      // While fading, the inline display keeps it on screen even though <html> is now "booted".
      style={phase === "fading" ? { display: "flex", opacity: 0, transitionDuration: `${FADE_MS}ms` } : undefined}
    >
      <div className="boot-grid pointer-events-none absolute inset-0" />

      <div className="relative flex flex-col items-center gap-5">
        <div className="relative grid size-24 place-items-center rounded-lg border-2 border-line-strong bg-module shadow-[0_0_40px_-12px_var(--color-copper)]">
          {/* Pins on all four sides */}
          {(["top", "bottom", "left", "right"] as const).map((side) => (
            <span key={side} className={`boot-pins boot-pins-${side}`} />
          ))}
          <span className="font-mono text-2xl font-medium text-ink">OA</span>
          <span
            className={`absolute bottom-3 right-3 size-2.5 rounded-full transition-all duration-300 ${
              phase === "running" ? "bg-line-strong" : "bg-led shadow-[0_0_10px_var(--color-led)]"
            }`}
          />
          <span className="absolute left-3 top-3 size-2.5 rounded-full border-[1.5px] border-[#5e7a6c]" />
        </div>
        <span className="text-xs tracking-[0.2em] text-dim">OA-BOOT · REV 2026.10</span>
      </div>

      <div className="relative w-full max-w-[460px] text-[13px] leading-7 sm:text-sm">
        <ol className="m-0 min-h-[calc(9*1.75rem)] list-none p-0">
          {LINES.slice(0, shown).map(([label, status]) => (
            <li key={label} className="boot-line flex items-baseline gap-2 text-muted">
              <span className="whitespace-nowrap">{label}</span>
              <span aria-hidden="true" className="min-w-4 flex-1 overflow-hidden whitespace-nowrap text-line-strong">
                ........................................................
              </span>
              <span className="text-copper">{status}</span>
            </li>
          ))}
          {phase !== "running" && (
            <li className="boot-line text-ink">
              <span className="text-led">●</span> READY · powering the board<span className="boot-caret">▌</span>
            </li>
          )}
        </ol>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-copper shadow-[0_0_10px_var(--color-copper)] transition-[width] duration-200 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <span className="absolute bottom-6 text-xs tracking-[0.12em] text-dim">PRESS ANY KEY OR TAP TO SKIP</span>
    </div>
  );
}
