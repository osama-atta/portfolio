import { profile } from "@/data/content";
import { PoweredSection } from "./circuit/PoweredSection";

/** The end of the spine. */
export function Contact() {
  return (
    <PoweredSection index={6} as="div" branch="edge" branchTop={56}>
      <footer
        id="contact"
        className="flex scroll-mt-20 flex-col items-center gap-[18px] rounded-[18px] border border-line bg-panel px-8 py-12 text-center"
      >
        <span className="inline-flex items-center gap-2.5 font-mono text-[15px] text-copper">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-led shadow-[0_0_10px_var(--led-glow)]" />
          J1 · I/O header
        </span>
        <h2 className="m-0 max-w-[760px] font-display text-[clamp(32px,4.5vw,48px)] font-bold">Have a problem worth solving? Let’s talk.</h2>
        <p className="m-0 max-w-[560px] text-[17px] leading-relaxed text-muted">
          Based in {profile.location} (Central Time). Open to remote roles and relocation.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a href={`mailto:${profile.email}`} className="rounded-md bg-copper px-[22px] py-3.5 text-base font-semibold text-board no-underline hover:brightness-110">
            Email me
          </a>
          <a href={profile.linkedin} className="rounded-md border border-line-strong px-[22px] py-[13px] text-base font-semibold text-ink no-underline hover:border-copper">
            LinkedIn
          </a>
          <a href={profile.github} className="rounded-md border border-line-strong px-[22px] py-[13px] text-base font-semibold text-ink no-underline hover:border-copper">
            GitHub
          </a>
        </div>
        {/* A board marking: where this board was made, like the coordinates printed on a real PCB. */}
        <span className="inline-flex items-center gap-2 pt-3 font-mono text-xs tracking-[0.12em] text-dim">
          <span aria-hidden="true" className="grid size-3.5 place-items-center rounded-full border border-dim">
            <span className="size-1 rounded-full bg-dim" />
          </span>
          {profile.location.toUpperCase()} · {profile.coordinates}
        </span>
      </footer>
    </PoweredSection>
  );
}
