"use client";

import { useEffect, useState } from "react";
import { education, experience } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { PoweredSection } from "./circuit/PoweredSection";
import { usePower } from "./circuit/SpineProvider";

const POWER_INDEX = 4;
const EDUCATION_INDEX = 5;

export function Experience() {
  const { on, reduced } = usePower(POWER_INDEX);
  // How many role LEDs have switched on; they light one by one from the top.
  const [litCount, setLitCount] = useState(0);
  // Light the LEDs one by one each time the section powers on; switch them
  // all off again when the current drops back above it.
  useEffect(() => {
    if (reduced) return;
    if (!on) {
      const reset = setTimeout(() => setLitCount(0), 0);
      return () => clearTimeout(reset);
    }
    const timers = experience.map((_, i) =>
      setTimeout(() => setLitCount((n) => Math.max(n, i + 1)), 200 + (i + 1) * 180),
    );
    return () => timers.forEach(clearTimeout);
  }, [on, reduced]);

  const shown = reduced ? experience.length : on ? litCount : 0;

  return (
    <>
      <PoweredSection index={POWER_INDEX} id="experience" className="flex flex-col gap-5">
        <SectionHeading eyebrow="A3 · Event log" title="Experience" badgeFor={POWER_INDEX} />
        <ol className="m-0 list-none rounded-[14px] border border-line bg-panel p-0">
          {experience.map((job, i) => {
            const lit = i < shown;
            const ledClass = !lit
              ? "bg-line-strong"
              : job.current
                ? "bg-led shadow-[0_0_8px_var(--color-led)]"
                : "bg-copper shadow-[0_0_8px_var(--color-copper)]";
            return (
              <li key={job.title} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-[22px] py-[18px] last:border-b-0">
                <span aria-hidden="true" className={`size-2.5 rounded-full transition-all duration-250 ${ledClass}`} />
                <span className="flex-[999_1_240px] font-semibold">
                  {job.title} · {job.org}
                </span>
                <span className="font-mono text-sm text-muted">{job.dates}</span>
              </li>
            );
          })}
        </ol>
      </PoweredSection>
      <PoweredSection index={EDUCATION_INDEX} id="education" className="flex flex-col gap-5">
        <SectionHeading eyebrow="A4 · Boot ROM" title="Education" badgeFor={EDUCATION_INDEX} />
        {/* Side by side on wider screens, stacked on phones. */}
        <div className="grid rounded-[14px] border border-line bg-panel px-[22px] md:grid-cols-2 md:gap-x-10">
          {education.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-1 border-b border-line py-[18px] last:border-b-0 md:border-b-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-10"
            >
              <span className="font-semibold">{item.title}</span>
              <span className="text-[15px] text-muted">{item.detail}</span>
            </div>
          ))}
        </div>
      </PoweredSection>
    </>
  );
}
