import { profile } from "@/data/content";
import { PoweredSection } from "./circuit/PoweredSection";

/**
 * The end of the spine. Centered on wide screens; on phones it's left-aligned
 * and compact, with Email full width and LinkedIn/GitHub side by side.
 */
export function Contact() {
  return (
    <PoweredSection index={6} as="div" branch="edge" branchTop={56}>
      <footer
        id="contact"
        // The top padding keeps the J1 label level with the branch (branchTop) at every size.
        className="flex scroll-mt-20 flex-col items-start gap-4 rounded-[18px] border border-line bg-panel px-5 pb-7 pt-[45px] sm:items-center sm:gap-[18px] sm:px-8 sm:py-12 sm:text-center"
      >
        <span className="inline-flex items-center gap-2.5 font-mono text-[15px] text-copper">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-led shadow-[0_0_10px_var(--led-glow)]" />
          J1 · I/O header
        </span>
        <h2 className="m-0 max-w-[760px] font-display text-[27px] leading-tight max-[380px]:text-[24px] font-bold sm:text-[clamp(32px,4.5vw,48px)] sm:leading-normal">Let’s build something together.</h2>
        <p className="m-0 max-w-[560px] text-[15px] leading-relaxed text-muted sm:text-[17px]">
          Always happy to talk anything tech.
        </p>
        <div className="grid w-full grid-cols-2 gap-2.5 pt-1 text-center sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-3 sm:pt-2">
          <a href={`mailto:${profile.email}`} className="col-span-2 rounded-md bg-copper px-[22px] py-3.5 text-base font-semibold text-board no-underline hover:brightness-110">
            Email me
          </a>
          <a href={profile.linkedin} className="rounded-md border border-line-strong px-3 py-[13px] text-base font-semibold text-ink no-underline hover:border-copper sm:px-[22px]">
            LinkedIn
          </a>
          <a href={profile.github} className="rounded-md border border-line-strong px-3 py-[13px] text-base font-semibold text-ink no-underline hover:border-copper sm:px-[22px]">
            GitHub
          </a>
        </div>
        {/* A board marking: where this board was made, like the coordinates printed on a real PCB. */}
        <span className="inline-flex items-center gap-2 pt-1 font-mono text-[11px] tracking-[0.08em] text-dim sm:pt-3 sm:text-xs sm:tracking-[0.12em]">
          <span aria-hidden="true" className="grid size-3.5 place-items-center rounded-full border border-dim">
            <span className="size-1 rounded-full bg-dim" />
          </span>
          {/* Phones show just the coordinates (the city is in the header) so it fits on one line. */}
          <span className="hidden sm:inline">{profile.location.toUpperCase()} · </span>
          {profile.coordinates}
        </span>
      </footer>
    </PoweredSection>
  );
}
