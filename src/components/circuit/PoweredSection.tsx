"use client";

import type { ReactNode } from "react";
import { usePower } from "./SpineProvider";

type Props = {
  /** Position from the top of the page; section 0 powers first. */
  index: number;
  as?: "section" | "div" | "footer";
  id?: string;
  className?: string;
  /** How far down from the section's top the branch joins it, in px. */
  branchTop?: number;
  /**
   * "pad": the branch ends in a small pad just before the section's text.
   * "edge": the branch runs all the way to the section's left edge (for boxed sections).
   */
  branch?: "pad" | "edge";
  children: ReactNode;
};

/**
 * A section wired to the spine. It sits dimmed in "standby" until the
 * current reaches its branch, then flashes on.
 */
export function PoweredSection({ index, as: Tag = "section", id, className = "", branchTop = 9, branch = "pad", children }: Props) {
  const { on, flashing } = usePower(index);

  return (
    <Tag
      id={id}
      className={`relative scroll-mt-20 transition-[opacity,filter] duration-[600ms] ease-out ${className}`}
      style={{
        opacity: on ? 1 : 0.32,
        filter: flashing ? "brightness(1.35) saturate(1.2)" : on ? "brightness(1) saturate(1)" : "brightness(0.75) saturate(0.2)",
      }}
    >
      <Branch index={index} top={branchTop} variant={branch} lit={on} />
      {children}
    </Tag>
  );
}

function Junction({ lit }: { lit: boolean }) {
  return (
    <span
      className={`absolute -left-1.5 -top-[5px] size-[13px] rounded-full border-[3px] transition-all duration-300 ${
        lit ? "border-copper bg-led shadow-[0_0_10px_var(--color-led)]" : "border-line-strong bg-panel"
      }`}
    />
  );
}

function Pad({ lit }: { lit: boolean }) {
  return (
    <span
      className={`absolute -right-1 -top-[3px] size-[9px] rounded-[2px] transition-all duration-300 ${
        lit ? "bg-copper shadow-[0_0_8px_var(--color-copper)]" : "bg-line-strong"
      }`}
    />
  );
}

function Branch({ index, top, variant, lit }: { index: number; top: number; variant: "pad" | "edge"; lit: boolean }) {
  // The spine's center sits at rail/2; sections start 20px right of the rail.
  const reach = variant === "edge" ? "calc(20px + var(--rail) / 2)" : "calc(12px + var(--rail) / 2)";
  return (
    <span
      data-branch={index}
      aria-hidden="true"
      className="absolute h-[3px] rounded-sm bg-line"
      style={{ top, left: "calc(-20px - var(--rail) / 2)", width: reach }}
    >
      <span
        className="absolute inset-y-0 left-0 rounded-sm bg-copper transition-[width] duration-[450ms] ease-out"
        style={{ width: lit ? "100%" : 0 }}
      />
      <Junction lit={lit} />
      {variant === "pad" && <Pad lit={lit} />}
    </span>
  );
}

/** "POWERED" / "STANDBY" tag shown next to a section's label. */
export function PowerBadge({ index }: { index: number }) {
  const { on } = usePower(index);
  return (
    <span
      className={`rounded px-2 py-[3px] text-[11px] tracking-[0.08em] transition-all duration-300 ${
        on ? "bg-copper text-board" : "bg-[#14291f] text-[#8fa89b]"
      }`}
    >
      {on ? "POWERED" : "STANDBY"}
    </span>
  );
}
