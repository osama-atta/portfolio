"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { BOOT_EVENT } from "../BootScreen";

/*
  The "spine": one copper trace that runs from the chip logo down the left
  edge of the page. As you scroll, current fills it, and each section whose
  branch the current has reached is "powered".

  How it works:
  - Every <PoweredSection> renders a branch element marked [data-branch].
  - On scroll, we measure where each branch sits and how far the current
    has travelled (62% of the way down the viewport).
  - The fill height is written straight to the DOM (it changes every frame),
    while which sections have power goes into React state (it changes
    rarely), so sections re-render only when they switch on or off.
  - Power follows where each branch leaves the spine, not the order of the
    indexes, so a section always powers when the current actually reaches it.
*/

type Power = {
  /** Bit n is set when section n has power (bitmask, so it's cheap to compare). */
  mask: number;
  /** Sections that just switched on and get a brief flash. */
  flashMask: number;
  reduced: boolean;
};

const PowerContext = createContext<Power>({ mask: 0, flashMask: 0, reduced: false });

/** Is section `index` powered, and did it just switch on? */
export function usePower(index: number) {
  const { mask, flashMask, reduced } = useContext(PowerContext);
  const bit = 1 << index;
  return {
    on: reduced || (mask & bit) !== 0,
    flashing: !reduced && (flashMask & bit) !== 0,
    reduced,
  };
}

const FLASH_MS = 650;
// After the boot screen, the current creeps down from the chip instead of
// appearing all at once: it waits RAMP_DELAY_MS, then travels RAMP_SPEED px/ms.
const RAMP_DELAY_MS = 300;
const RAMP_SPEED = 0.3;

export function SpineProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef(0);
  const [power, setPower] = useState({ mask: 0, flashMask: 0 });
  const [endLit, setEndLit] = useState(false);

  useEffect(() => {
    let frame = 0;
    let flashTimer: ReturnType<typeof setTimeout> | undefined;
    // Power-up: nothing has power until boot finishes ("waiting"), then the fill ramps down.
    let ramping = !reduced;
    let waiting = !reduced && !window.__oaBooted;
    let rampStart: number | null = null;

    const update = () => {
      frame = 0;
      const wrap = wrapRef.current;
      const track = trackRef.current;
      const fill = fillRef.current;
      if (!wrap || !track || !fill) return;

      const wrapRect = wrap.getBoundingClientRect();
      const trackTop = track.offsetTop;
      // Each branch carries its section's index in data-branch.
      const branches = Array.from(wrap.querySelectorAll<HTMLElement>("[data-branch]")).map((el) => ({
        index: Number(el.dataset.branch),
        y: el.getBoundingClientRect().top - wrapRect.top + 1,
      }));
      const lastY = branches.length ? Math.max(...branches.map((b) => b.y)) : trackTop + 400;
      const trackLen = Math.max(40, lastY - trackTop);
      track.style.height = `${trackLen}px`;

      const vh = window.innerHeight || 800;
      const atBottom = wrapRect.bottom <= vh + 8; // the last sections can't reach the 62% line, so power everything
      const target = reduced || atBottom ? Infinity : vh * 0.62 - wrapRect.top;
      let fillLen = Math.max(0, Math.min(trackLen, target - trackTop));
      if (ramping) {
        const now = performance.now();
        rampStart ??= waiting ? null : now + RAMP_DELAY_MS;
        const limit = rampStart === null ? 0 : Math.max(0, (now - rampStart) * RAMP_SPEED);
        if (limit >= fillLen) {
          ramping = false;
          fill.style.transition = "";
        } else {
          fillLen = limit;
          fill.style.transition = "none"; // the ramp itself is the animation
        }
      }
      fill.style.height = `${fillLen}px`;

      const reach = trackTop + fillLen + 2;
      const mask = branches.reduce((m, b) => (b.y <= reach ? m | (1 << b.index) : m), 0);
      const prev = maskRef.current;
      if (mask !== prev) {
        maskRef.current = mask;
        const switchedOn = mask & ~prev;
        if (switchedOn && !reduced) {
          setPower({ mask, flashMask: switchedOn });
          clearTimeout(flashTimer);
          flashTimer = setTimeout(() => setPower((p) => ({ ...p, flashMask: 0 })), FLASH_MS);
        } else {
          setPower({ mask, flashMask: 0 });
        }
      }
      setEndLit(fillLen >= trackLen - 1);
      if (ramping && !waiting) schedule(); // keep the ramp moving every frame
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onBoot = () => {
      waiting = false;
      schedule();
    };
    const onScroll = () => {
      if (ramping && !waiting) {
        // The visitor is scrolling: stop the slow ramp and just follow the scroll.
        ramping = false;
        fillRef.current?.style.removeProperty("transition");
      }
      schedule();
    };

    schedule();
    const settle = setTimeout(schedule, 300); // re-measure once fonts have loaded and the layout has settled
    window.addEventListener(BOOT_EVENT, onBoot);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      clearTimeout(flashTimer);
      window.removeEventListener(BOOT_EVENT, onBoot);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
    };
  }, [reduced]);

  return (
    <PowerContext.Provider value={{ ...power, reduced }}>
      <div
        ref={wrapRef}
        className="relative mx-auto max-w-[1200px] px-6 pb-[72px]"
        style={{ "--rail": "clamp(36px, 5vw, 64px)" } as CSSProperties}
      >
        {/* The spine itself: a dark track, the copper "current", and a glowing signal at its tip. */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-6 top-0" style={{ width: "var(--rail)" }}>
          <div
            ref={trackRef}
            className="absolute w-1 rounded-sm bg-line"
            style={{ left: "calc(var(--rail) / 2 - 2px)", top: "calc(22px + var(--rail) - 2px)", height: 2400 }}
          >
            <div
              ref={fillRef}
              className="absolute left-0 top-0 h-0 w-1 rounded-sm bg-copper shadow-[0_0_8px_var(--color-copper)] transition-[height] duration-500 ease-out"
            >
              <span className="absolute -bottom-1.5 -left-1 size-3 rounded-full bg-led shadow-[0_0_10px_var(--color-led),0_0_22px_var(--led-glow)]" />
            </div>
            <span
              className={`absolute -bottom-2 -left-1.5 size-4 rounded-full border-[3px] bg-board transition-all duration-300 ${
                endLit ? "border-copper shadow-[0_0_12px_var(--color-copper)]" : "border-line-strong"
              }`}
            />
          </div>
        </div>
        {children}
      </div>
    </PowerContext.Provider>
  );
}
