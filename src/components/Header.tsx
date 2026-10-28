import { profile } from "@/data/content";
import { withBasePath } from "@/lib/basePath";
import { ChipLogo } from "./ChipLogo";
import { LocalTime } from "./LocalTime";
import { PinIcon } from "./PinIcon";

export const NAV = [
  { href: "#now", label: "Now" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

/**
 * The header at the top of the page: the chip logo (where the spine starts),
 * name, role and city, and the links. Once it scrolls out of view, a slim
 * StickyHeader takes over at the top of the screen.
 */
export function Header() {
  return (
    <header id="site-header" className="flex flex-wrap items-center justify-between gap-4 py-[22px]">
      <a href="#top" className="inline-flex items-center gap-4 font-display text-[22px] font-bold text-ink no-underline">
        <ChipLogo />
        <span className="flex flex-col gap-1">
          <span>{profile.name}</span>
          {/* Role and city: one line on wider screens; on phones, two lines with the local time. */}
          <span className="flex flex-col gap-0.5 font-mono text-xs font-normal text-muted sm:flex-row sm:items-center sm:gap-2">
            <span>{profile.eyebrow}</span>
            <span aria-hidden="true" className="hidden text-line-strong sm:inline">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PinIcon className="size-3" />
              {profile.location}
              <span className="sm:hidden">
                <span aria-hidden="true" className="text-line-strong">
                  {" "}
                  ·{" "}
                </span>
                <LocalTime timeZone={profile.timeZone} fallback="Central Time" />
              </span>
            </span>
          </span>
        </span>
      </a>
      {/* Indented on small screens so the wrapped nav doesn't sit on top of the spine. */}
      <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 pl-[calc(var(--rail)+20px)] text-[15px] font-medium lg:pl-0">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="px-3 py-3 text-soft no-underline hover:text-ink">
            {item.label}
          </a>
        ))}
        <a
          href={withBasePath(profile.resumeFile)}
          className="rounded-md bg-copper px-[18px] py-3 font-semibold text-board no-underline hover:brightness-110"
        >
          Résumé
        </a>
      </nav>
    </header>
  );
}
