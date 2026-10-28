import { experience, profile } from "@/data/content";
import { withBasePath } from "@/lib/basePath";
import { PoweredSection } from "./circuit/PoweredSection";

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

// The job I have now (the one marked current in the experience list), shown at the top of the hero.
const currentRole = experience.find((e) => e.current) ?? experience[0];

export function Hero() {
  return (
    <PoweredSection index={1} branchTop={12} className="-mt-10 flex max-w-[900px] flex-col gap-[22px]">
      {/* Reference designator (A1, like the sections below) and my current role.
          The top padding centers the first line on the branch, which sits 13.5px down (branchTop + half its 3px height). */}
      <p className="m-0 pt-[5.5px] font-mono text-xs text-copper sm:pt-[3.5px] sm:text-[15px]">
        A1 · {currentRole.title} <span className="whitespace-nowrap text-soft">@ {currentRole.org}</span>
      </p>
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
