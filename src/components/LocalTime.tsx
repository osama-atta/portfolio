"use client";

import { useSyncExternalStore } from "react";

/*
  The current time where I am, e.g. "7:53 PM CDT", so remote teams can see my
  time zone at a glance. It's read in the visitor's browser and refreshes every
  15 seconds; in the static HTML (no clock at build time) it says "Central Time".
*/

const subscribe = (tick: () => void) => {
  const id = setInterval(tick, 15_000);
  return () => clearInterval(id);
};

export function LocalTime({ timeZone, fallback }: { timeZone: string; fallback: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () => new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date()),
    () => null,
  );
  return <span suppressHydrationWarning>{time ?? fallback}</span>;
}
