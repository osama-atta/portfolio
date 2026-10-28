"use client";

import { useEffect, type RefObject } from "react";

/** The three-line menu icon. It turns into an ✕ while the menu is open. */
export function MenuIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-3.5 w-[18px]">
      <span className={`absolute left-0 h-0.5 w-full bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
      <span className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
      <span className={`absolute left-0 h-0.5 w-full bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
    </span>
  );
}

/** Closes an open menu on Escape, or on a click anywhere outside `areaRef`. */
export function useMenuDismiss(open: boolean, close: () => void, areaRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onClick = (e: MouseEvent) => {
      if (!areaRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [open, close, areaRef]);
}
