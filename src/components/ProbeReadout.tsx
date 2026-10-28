"use client";

import { useEffect } from "react";
import { builds, projects, type Metric } from "@/data/content";
import { Digit, toDigits } from "./SevenSegment";

/**
 * The multimeter that appears when a visitor probes a test point. It shows
 * the reading on an LCD and explains where the number came from.
 */
export function ProbeReadout({ metric, onClose }: { metric: Metric; onClose: () => void }) {
  const { probe } = metric;
  const project = [...projects, ...builds].find((p) => p.id === probe.projectId);

  // Escape closes the meter.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      id="probe-readout"
      role="region"
      aria-label={`Probe readout for ${metric.label}`}
      className="flex flex-wrap items-stretch gap-6 rounded-xl border border-copper bg-panel p-5 shadow-[0_0_24px_-10px_var(--color-copper)] sm:p-6"
    >
      {/* The meter itself */}
      <div aria-hidden="true" className="flex w-[260px] flex-none flex-col gap-3 rounded-2xl border-2 border-[#2c3136] bg-[#1c1f22] p-4">
        <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.1em] text-[#a3abb3]">
          <span>OA-DMM</span>
          <span className="text-copper">PROBE {metric.id}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-md bg-[#a7b59a] px-3 py-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]">
          <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-[#1b2418]">{probe.mode}</span>
          <div className="flex items-end gap-1">
            {metric.prefix && <span className="pb-0.5 font-mono text-[22px] leading-none text-[#1b2418]">{metric.prefix}</span>}
            {toDigits(metric.value.toFixed(metric.decimals)).map((d, i) => (
              <Digit key={i} char={d.char} point={d.point} tone="lcd" />
            ))}
            {metric.suffix && <span className="pb-0.5 font-mono text-[22px] leading-none text-[#1b2418]">{metric.suffix}</span>}
          </div>
        </div>
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="flex flex-col items-center gap-1 font-mono text-[10px] text-[#a3abb3]">
            <span className="size-4 rounded-full border-[3px] border-[#111] bg-[#333] shadow-[0_0_0_2px_#3a3f45]" />
            COM
          </span>
          <span className="size-12 rounded-full border-4 border-[#2c3136] bg-[#121416] shadow-[inset_0_0_0_2px_#3a3f45]">
            <span className="mx-auto mt-1 block h-4 w-1 rounded-full bg-copper" />
          </span>
          <span className="flex flex-col items-center gap-1 font-mono text-[10px] text-[#a3abb3]">
            <span className="size-4 rounded-full border-[3px] border-[#5a1414] bg-led shadow-[0_0_0_2px_#3a3f45]" />
            V Ω
          </span>
        </div>
      </div>

      {/* What the reading means */}
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[13px] text-copper">
              {metric.id} · {metric.label}
            </span>
            <p className="m-0 text-[17px] leading-relaxed text-ink">{probe.measured}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close probe readout"
            className="grid size-11 flex-none place-items-center rounded-md border border-line-strong font-mono text-base text-ink hover:border-copper"
          >
            ✕
          </button>
        </div>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[15px]">
          <dt className="font-mono text-[13px] text-dim">ROLE</dt>
          <dd className="m-0 text-muted">{probe.role}</dd>
          <dt className="font-mono text-[13px] text-dim">WHEN</dt>
          <dd className="m-0 text-muted">{probe.dates}</dd>
        </dl>
        {project && (
          <a href={`#project-${project.id}`} className="mt-auto self-start py-2 text-[15px] font-semibold text-copper no-underline hover:underline">
            Trace it to the project: {project.title} →
          </a>
        )}
      </div>
    </div>
  );
}
