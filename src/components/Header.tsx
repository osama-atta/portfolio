import { profile } from "@/data/content";
import { withBasePath } from "@/lib/basePath";
import { ChipLogo } from "./ChipLogo";
import { HeaderMenu } from "./HeaderMenu";
import { LocalTime } from "./LocalTime";
import { NAV } from "./nav";
import { PinIcon } from "./PinIcon";

/**
 * The header at the top of the page: the chip logo (where the spine starts),
 * name, role and city, and the links. Once it scrolls out of view, a slim
 * StickyHeader takes over at the top of the screen.
 *
 * From 1024px up the links sit on the right; below that they fold into a menu
 * button (HeaderMenu), like the pinned bar.
 */
export function Header() {
  return (
    <header id="site-header" className="relative flex items-center justify-between gap-3 py-[22px]">
      <a href="#top" className="inline-flex min-w-0 items-center gap-3 font-display text-[22px] font-bold text-ink no-underline sm:gap-4">
        <ChipLogo spineOrigin designator="U1" />
        <span className="flex min-w-0 flex-col gap-1">
          <span>{profile.name}</span>
          {/* Role, city and the local time: one line on wider screens; on phones, two lines. */}
          <span className="flex flex-col gap-0.5 font-mono text-xs font-normal text-muted sm:flex-row sm:items-center sm:gap-2">
            {/* On the narrowest phones (under 380px) the shorter role leaves room for the menu button. */}
            <span className="max-[380px]:hidden">{profile.eyebrow}</span>
            <span className="hidden max-[380px]:inline">{profile.roleShort}</span>
            <span aria-hidden="true" className="hidden text-line-strong sm:inline">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <PinIcon className="size-3" />
              {profile.location}
              <span>
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
      <nav aria-label="Primary" className="hidden items-center gap-1 text-[15px] font-medium lg:flex">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="px-3 py-3 text-soft no-underline hover:text-ink">
            {item.label}
          </a>
        ))}
        <a
          href={withBasePath(profile.resumeFile)}
          data-resume
          className="rounded-md bg-copper px-[18px] py-3 font-semibold text-board no-underline hover:brightness-110"
        >
          Résumé
        </a>
      </nav>
      <HeaderMenu />
    </header>
  );
}
