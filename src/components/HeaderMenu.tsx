"use client";

import { useCallback, useRef, useState } from "react";
import { profile } from "@/data/content";
import { withBasePath } from "@/lib/basePath";
import { MenuIcon, useMenuDismiss } from "./MenuButton";
import { NAV } from "./nav";

/**
 * The header's links below 1024px: a menu button that drops the links down
 * over the page, the same way the pinned bar's menu does.
 */
export function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useMenuDismiss(open, close, areaRef);

  return (
    <div ref={areaRef} className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="header-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="-mr-2.5 grid size-11 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-ink"
      >
        <MenuIcon open={open} />
      </button>

      {open && (
        <nav
          id="header-menu"
          aria-label="Primary (menu)"
          className="absolute inset-x-0 top-full z-30 -mx-6 border-y border-line bg-board/95 shadow-[0_16px_30px_-16px_rgb(0_0_0/0.9)] backdrop-blur-md"
        >
          <div className="flex flex-col gap-1 py-3 pl-[calc(var(--rail)+44px)] pr-6">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={close} className="py-2.5 text-[17px] text-soft no-underline hover:text-ink">
                {item.label}
              </a>
            ))}
            <a
              href={withBasePath(profile.resumeFile)}
              data-resume
              onClick={close}
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
