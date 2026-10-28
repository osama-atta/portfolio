import { profile } from "@/data/content";
import { withBasePath } from "@/lib/basePath";
import { PoweredSection } from "./circuit/PoweredSection";
import { LocalTime } from "./LocalTime";

/** Turns **bold** markers in a sentence into <strong> text. */
function withBold(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export function Hero() {
  return (
    <PoweredSection index={1} branchTop={12} className="-mt-10 flex max-w-[900px] flex-col gap-[22px]">
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
        <p className="m-0 font-mono text-[15px] text-copper">{profile.eyebrow}</p>
        {/* Where I am and what time it is there, so remote teams can place me. */}
        <p className="m-0 inline-flex flex-wrap items-center gap-x-2 rounded-2xl border border-line-strong bg-panel px-3 py-1 font-mono text-[13px] text-soft">
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 flex-none text-copper">
            <path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.4 4.5 8.5 4.5 8.5s4.5-5.1 4.5-8.5A4.5 4.5 0 0 0 8 1.5Z" fill="currentColor" />
            <circle cx="8" cy="6" r="1.7" fill="var(--color-board)" />
          </svg>
          <span>{profile.location}</span>
          <span aria-hidden="true" className="text-dim">·</span>
          <LocalTime timeZone={profile.timeZone} fallback="Central Time" />
          <span aria-hidden="true" className="text-dim">·</span>
          <span className="text-copper">{profile.availability}</span>
        </p>
      </div>
      <h1 className="m-0 font-display text-[clamp(40px,5.6vw,66px)] font-bold leading-[1.05] tracking-[-0.02em]">{profile.headline}</h1>
      <p className="m-0 max-w-[640px] text-[19px] leading-relaxed text-muted">{withBold(profile.intro)}</p>
      <div className="flex flex-wrap gap-3 pt-1">
        <a href="#work" className="rounded-md bg-copper px-[22px] py-3.5 text-base font-semibold text-board no-underline hover:brightness-110">
          See selected work
        </a>
        <a
          href={withBasePath(profile.resumeFile)}
          className="rounded-md border border-line-strong px-[22px] py-[13px] text-base font-semibold text-ink no-underline hover:border-copper"
        >
          Download résumé
        </a>
      </div>
    </PoweredSection>
  );
}
