"use client";

import { useEffect } from "react";

// The favicon (app/icon.svg) with its LED switched off: the same chip, with the LED a dark red.
const LED_OFF_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="#D9A441"><rect x="17" y="2" width="6" height="9"/><rect x="17" y="53" width="6" height="9"/><rect x="2" y="17" width="9" height="6"/><rect x="53" y="17" width="9" height="6"/><rect x="29" y="2" width="6" height="9"/><rect x="29" y="53" width="6" height="9"/><rect x="2" y="29" width="9" height="6"/><rect x="53" y="29" width="9" height="6"/><rect x="41" y="2" width="6" height="9"/><rect x="41" y="53" width="6" height="9"/><rect x="2" y="41" width="9" height="6"/><rect x="53" y="41" width="9" height="6"/></g><rect x="10" y="10" width="44" height="44" rx="5" fill="#121614" stroke="#2B5040" stroke-width="2.5"/><g fill="none" stroke="#E6F0EA" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><rect x="17.5" y="19" width="11" height="18" rx="5.5"/><path d="M35 37 L40.5 19 L46 37 M37 31 H44"/></g><circle cx="45.5" cy="46.5" r="4.3" fill="#4A1E1E"/></svg>',
)}`;

/**
 * The favicon's LED is lit while this tab is in front and switches off while
 * the visitor is on another tab, then lights back up when they come back.
 *
 * It swaps the href of the page's icon links (the SVG and the .ico) for the
 * LED-off version while the page is hidden, and puts the originals back when
 * it's visible again. The LED-off icon is inline, so no download is needed
 * while the tab is in the background.
 */
export function FaviconLed() {
  useEffect(() => {
    const original = new Map<HTMLLinkElement, { href: string; type: string | null }>();

    const update = () => {
      for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')) {
        if (!original.has(link)) original.set(link, { href: link.href, type: link.getAttribute("type") });
        const saved = original.get(link)!;
        if (document.hidden) {
          link.href = LED_OFF_ICON;
          link.type = "image/svg+xml";
        } else {
          link.href = saved.href;
          if (saved.type) link.type = saved.type;
        }
      }
    };

    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      for (const [link, saved] of original) {
        link.href = saved.href;
        if (saved.type) link.type = saved.type;
      }
    };
  }, []);

  return null;
}
