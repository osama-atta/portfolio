import { profile } from "@/data/content";
import { withBasePath } from "@/lib/basePath";
import { PowerBadge, PoweredSection } from "./circuit/PoweredSection";

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
    <PoweredSection index={1} className="-mt-10 flex max-w-[900px] flex-col gap-[22px]">
      {/*
        Labelled like the other sections (designator · part, with a power badge). A1 is the board's
        ID register, the part a real chip uses to report what it is; the intro below opens with my role.
      */}
      <span className="inline-flex flex-wrap items-center gap-2.5 font-mono text-sm text-copper">
        A1 · ID register
        <PowerBadge index={1} />
      </span>
      <h1 className="m-0 font-display text-[clamp(40px,5.6vw,66px)] font-bold leading-[1.05] tracking-[-0.02em]">{profile.headline}</h1>
      <p className="m-0 max-w-[640px] text-[19px] leading-relaxed text-muted">{withBold(profile.intro)}</p>
      <div className="pt-1">
        <a
          href={withBasePath(profile.resumeFile)}
          data-resume
          className="inline-block rounded-md bg-copper px-[22px] py-3.5 text-base font-semibold text-board no-underline hover:brightness-110"
        >
          View résumé
        </a>
      </div>
    </PoweredSection>
  );
}
