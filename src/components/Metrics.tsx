"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { metrics } from "@/data/content";
import { Digit, toDigits } from "./SevenSegment";
import { SectionHeading } from "./SectionHeading";
import { PoweredSection } from "./circuit/PoweredSection";
import { usePower } from "./circuit/SpineProvider";
import { ProbeReadout } from "./ProbeReadout";

const POWER_INDEX = 2;
const STAGGER_MS = 650; // gap between probing one test point and the next
const MEASURE_MS = 1100; // how long each reading takes to settle

type Stage = "standby" | "measuring" | "measured";

/**
 * "Test points": when the current reaches this section, each impact number
 * is measured in turn: standby → measuring (digits climb) → measured.
 * Clicking a test point "probes" it: a multimeter opens below with the story
 * behind the number.
 */
export function Metrics() {
  const { on, reduced } = usePower(POWER_INDEX);
  const frameRef = useRef(0);
  // Per-metric progress: -1 = not started yet, 0…1 = measuring, 1 = done.
  const [progress, setProgress] = useState<number[]>(() => metrics.map(() => -1));
  // Which test point is being probed, if any.
  const [probed, setProbed] = useState<number | null>(null);
  const closeProbe = useCallback(() => setProbed(null), []);

  const measure = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    const total = (metrics.length - 1) * STAGGER_MS + MEASURE_MS;
    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      const elapsed = now - start;
      setProgress(
        metrics.map((_, i) => {
          const t = (elapsed - i * STAGGER_MS) / MEASURE_MS;
          return t < 0 ? -1 : Math.min(1, t);
        }),
      );
      if (elapsed < total) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }, []);

  // Measure every time this section gets power. When the current drops back
  // above it (you scroll back up past it), stop and reset to standby so the
  // sequence plays again next time.
  useEffect(() => {
    if (reduced) return;
    if (on) {
      measure();
      return () => cancelAnimationFrame(frameRef.current);
    }
    cancelAnimationFrame(frameRef.current);
    const reset = requestAnimationFrame(() => setProgress(metrics.map(() => -1)));
    return () => cancelAnimationFrame(reset);
  }, [on, reduced, measure]);

  return (
    <PoweredSection index={POWER_INDEX} id="impact" className="flex flex-col gap-[22px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading eyebrow="A1 · Test points" title="Impact so far" badgeFor={POWER_INDEX} />
        {!reduced && (
          <button
            type="button"
            onClick={measure}
            className="min-h-11 rounded-md border border-line-strong bg-panel px-4 font-mono text-sm text-ink hover:border-copper"
          >
            ↻ Re-measure
          </button>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {metrics.map((m, i) => {
          const t = reduced ? 1 : progress[i];
          const stage: Stage = t < 0 ? "standby" : t >= 1 ? "measured" : "measuring";
          const eased = t < 0 ? 0 : 1 - Math.pow(1 - Math.min(1, t), 3);
          const target = m.value.toFixed(m.decimals);
          const reading =
            stage === "standby"
              ? target.replace(/[0-9]/g, "-")
              : (m.value * eased).toFixed(m.decimals).padStart(target.length, " ");
          const idle = stage === "standby";
          const isProbed = probed === i;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setProbed(isProbed ? null : i)}
              aria-expanded={isProbed}
              aria-controls="probe-readout"
              className={`group flex w-full cursor-pointer flex-col gap-3.5 rounded-xl border bg-panel p-5 text-left font-[inherit] text-ink transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 ${
                isProbed
                  ? "border-copper shadow-[0_0_0_2px_var(--color-copper),0_0_24px_-6px_var(--color-copper)]"
                  : stage === "measured"
                    ? "border-copper shadow-[0_0_18px_-6px_var(--color-copper)]"
                    : idle
                      ? "border-line hover:border-line-strong"
                      : "border-[#3a6150]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 font-mono text-[13px]">
                <span className="inline-flex items-center gap-2 text-muted">
                  <span
                    aria-hidden="true"
                    className={`size-3.5 rounded-full border-[3px] transition-all duration-250 ${
                      idle
                        ? "border-line-strong bg-transparent"
                        : stage === "measured"
                          ? "border-copper bg-copper shadow-[0_0_8px_var(--color-copper)]"
                          : "border-copper bg-led shadow-[0_0_8px_var(--color-led)]"
                    }`}
                  />
                  {m.id}
                </span>
                <span
                  className={`text-[11px] tracking-[0.08em] transition-colors duration-250 ${
                    idle ? "text-dim" : stage === "measured" ? "text-copper" : "text-led"
                  }`}
                >
                  {idle ? "STANDBY" : stage === "measured" ? "✓ MEASURED" : "MEASURING…"}
                </span>
              </div>

              <div
                aria-hidden="true"
                className={`flex min-h-16 items-end gap-1 overflow-hidden rounded-lg border border-line bg-[#050605] px-3.5 py-3 ${
                  idle ? "" : "drop-shadow-[0_0_6px_var(--led-glow)]"
                }`}
              >
                {m.prefix && <span className={`pb-0.5 font-mono text-[26px] leading-none ${idle ? "text-led/30" : "text-led"}`}>{m.prefix}</span>}
                {toDigits(reading).map((d, j) => (
                  <Digit key={j} char={d.char} point={d.point} dim={idle} />
                ))}
                {m.suffix && <span className={`pb-0.5 font-mono text-[26px] leading-none ${idle ? "text-led/30" : "text-led"}`}>{m.suffix}</span>}
              </div>

              <div className="flex flex-col gap-0.5">
                {/* The readable version of the number, for screen readers and copy-paste. */}
                <span className="sr-only">
                  {m.prefix}
                  {m.value.toLocaleString("en-US", { minimumFractionDigits: m.decimals })}
                  {m.suffix}
                </span>
                <span className="text-[17px] font-semibold">{m.label}</span>
                <span className="text-[15px] text-muted">{m.sub}</span>
              </div>
              <span className={`font-mono text-xs tracking-[0.06em] ${isProbed ? "text-copper" : "text-dim group-hover:text-copper"}`}>
                {isProbed ? "▾ PROBED · CLICK TO CLOSE" : "▸ CLICK TO PROBE"}
              </span>
            </button>
          );
        })}
      </div>

      {probed !== null && <ProbeReadout metric={metrics[probed]} onClose={closeProbe} />}
    </PoweredSection>
  );
}
