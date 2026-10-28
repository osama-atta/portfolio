"use client";

import { useSyncExternalStore } from "react";

// Matches Tailwind's `sm` breakpoint: below 640px wide is a phone-sized screen.
const QUERY = "(max-width: 639px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * True on phone-sized screens. Used where the layout itself has to change in
 * JavaScript (like the LED sign's grid), not just its CSS. During the static
 * build there's no screen, so it returns false (the desktop layout).
 */
export function useNarrowScreen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
