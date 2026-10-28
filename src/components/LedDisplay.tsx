"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { layoutFrames } from "@/lib/ledFont";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { usePower } from "./circuit/SpineProvider";

type Stage = "flash" | "hold" | "off";

const FLASH_MS = 140;
const BLANK_MS = 200;

const DOT = "radial-gradient(circle closest-side, currentColor 70%, transparent 76%)";
const UNLIT_DOT = "radial-gradient(circle closest-side, rgb(255 255 255 / 0.07) 70%, transparent 76%)";

/**
 * A dot-matrix LED sign that flashes between short messages.
 * It's a small state machine: flash → hold → off → (next frame) flash …
 * Every state change happens inside a timeout, and the effect's cleanup
 * clears it, so nothing leaks when the component unmounts.
 * The panel stays dark until its section on the spine has power.
 *
 * Which message is showing (`index`) belongs to the parent, so buttons can
 * jump to a message; the sign asks for the next one with `onAuto`.
 */
export function LedDisplay({
  frames,
  index,
  onAuto,
  holdMs = 2200,
  powerIndex,
}: {
  frames: string[][];
  index: number;
  /** The sign moving on by itself: to the next message, or back to 0 when it loses power. */
  onAuto: (next: number) => void;
  holdMs?: number;
  powerIndex: number;
}) {
  const layout = useMemo(() => layoutFrames(frames), [frames]);
  const reduced = usePrefersReducedMotion();
  const { on, flashing } = usePower(powerIndex);
  const [stage, setStage] = useState<Stage>("flash");
  const autoTo = useEffectEvent((next: number) => onAuto(next));

  // Every new message (automatic or picked by the visitor) comes in with a flash.
  useEffect(() => {
    const t = setTimeout(() => setStage("flash"), 0);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (reduced) return; // no automatic cycling; the buttons still step through messages
    if (!on) {
      // No power: rewind, so the sign always starts from the first message when it switches on.
      const rewind = setTimeout(() => autoTo(0), 0);
      return () => clearTimeout(rewind);
    }
    const delay = stage === "flash" ? FLASH_MS : stage === "hold" ? holdMs : BLANK_MS;
    const timer = setTimeout(() => {
      if (stage === "flash") setStage("hold");
      else if (stage === "hold") setStage("off");
      else autoTo((index + 1) % layout.frames.length);
    }, delay);
    return () => clearTimeout(timer);
  }, [stage, reduced, holdMs, layout.frames.length, on, index]);

  const runs = layout.frames[index];

  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${layout.cols} / ${layout.rows}`,
        backgroundImage: UNLIT_DOT,
        backgroundSize: `${100 / layout.cols}% ${100 / layout.rows}%`,
      }}
    >
      <div
        // The lit dots flicker like a warming-up screen at the moment the sign gets power.
        className={`absolute inset-0 text-led transition-[opacity,filter] duration-200 ease-out ${on && flashing ? "power-flicker" : ""}`}
        style={{
          opacity: !on || stage === "off" ? 0 : 1,
          filter:
            stage === "flash"
              ? "brightness(1.8) drop-shadow(0 0 12px var(--led-glow))"
              : "drop-shadow(0 0 4px var(--led-glow))",
        }}
      >
        {runs.map((r, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: `${r.left}%`,
              top: `${r.top}%`,
              width: `${r.width}%`,
              height: `${r.height}%`,
              backgroundImage: DOT,
              backgroundSize: `${r.dotSize}% 100%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
