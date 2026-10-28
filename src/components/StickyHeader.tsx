"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/content";
import { withBasePath } from "@/lib/basePath";
import { MenuIcon, useMenuDismiss } from "./MenuButton";
import { NAV } from "./nav";
import { PinIcon } from "./PinIcon";

/**
 * A slim bar that slides down from the top once the real header has scrolled
 * out of view, so your name, role and city are always on screen.
 *
 * There's deliberately no chip logo here: the chip stays at the top of the page
 * where the spine starts. The bar is see-through with a blur, so the copper
 * spine stays visible running up behind it.
 *
 * Wide screens show the links; narrower ones fold them into a menu button.
 */
export function StickyHeader() {
  const [shown, setShown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Show the bar whenever the real header is off screen.
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShown(!entry.isIntersecting);
      if (entry.isIntersecting) setMenuOpen(false);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Close the menu with Escape or a click anywhere outside the bar.
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useMenuDismiss(menuOpen, closeMenu, barRef);

  return (
    <div
      ref={barRef}
      inert={!shown}
      className={`fixed inset-x-0 top-0 z-40 border-b border-line bg-board/70 shadow-[0_8px_20px_-12px_rgb(0_0_0/0.9)] backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${
        shown ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-2 pl-6 pr-2 lg:gap-3 lg:pr-6">
        <a href="#top" className="flex min-w-0 items-center gap-3 pl-[calc(var(--rail)+20px)] text-ink no-underline">
          <span className="flex min-w-0 flex-col lg:flex-row lg:items-center lg:gap-3">
            <span className="font-display text-base font-bold lg:text-lg">{profile.name}</span>
            <span aria-hidden="true" className="hidden h-4 w-px bg-line-strong lg:block" />
            <span className="flex items-center gap-1.5 truncate font-mono text-[11px] text-muted lg:gap-2 lg:text-[12.5px]">
              <span className="truncate">
                <span className="lg:hidden">{profile.roleShort}</span>
                <span className="hidden lg:inline">{profile.eyebrow}</span>
              </span>
              <span aria-hidden="true" className="text-line-strong">
                ·
              </span>
              <span className="inline-flex flex-none items-center gap-1.5">
                <PinIcon className="hidden size-3 lg:block" />
                {profile.location}
              </span>
            </span>
          </span>
        </a>

        {/* Wide screens: the links, as in the header. */}
        <nav aria-label="Primary (pinned)" className="hidden items-center gap-0.5 text-[15px] font-medium lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="px-2.5 py-2 text-soft no-underline hover:text-ink">
              {item.label}
            </a>
          ))}
          <a
            href={withBasePath(profile.resumeFile)}
            data-resume
            className="ml-1.5 rounded-md bg-copper px-3.5 py-2 font-semibold text-board no-underline hover:brightness-110"
          >
            Résumé
          </a>
        </nav>

        {/* Narrower screens: a menu button. */}
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="pinned-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
          className="grid size-11 flex-none cursor-pointer place-items-center rounded-md border-0 bg-transparent text-ink lg:hidden"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen && (
        <nav id="pinned-menu" aria-label="Primary (menu)" className="border-t border-line bg-board/95 lg:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-6 py-3 pl-[calc(var(--rail)+44px)]">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="py-2.5 text-[17px] text-soft no-underline hover:text-ink">
                {item.label}
              </a>
            ))}
            <a
              href={withBasePath(profile.resumeFile)}
              data-resume
              onClick={() => setMenuOpen(false)}
              className="mt-1 self-start rounded-md bg-copper px-[18px] py-2.5 font-semibold text-board no-underline hover:brightness-110"
            >
              Résumé
            </a>
          </div>
        </nav>
      )}
    </div>
  );
}
