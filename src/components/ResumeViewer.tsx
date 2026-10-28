"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/data/content";
import { withBasePath } from "@/lib/basePath";

/**
 * The résumé viewer. Every "Résumé" link on the page is a normal link to the
 * PDF with a `data-resume` attribute; this component catches those clicks and
 * shows a preview of the page in a window instead, with "Open in new tab" and
 * "Download PDF". Without JavaScript, or with Ctrl/Cmd/Shift-click, the link
 * just opens the PDF as usual.
 *
 * On phones the window fills the screen and the buttons move to a bar at the
 * bottom, where a thumb can reach them.
 */
export function ResumeViewer() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("a[data-resume]")) return;
      const dialog = dialogRef.current;
      if (!dialog || typeof dialog.showModal !== "function" || dialog.open) return;

      event.preventDefault();
      // Stop the page scrolling behind the window, without a jump where the scrollbar was.
      const root = document.documentElement;
      root.style.setProperty("--scrollbar-width", `${window.innerWidth - root.clientWidth}px`);
      root.classList.add("resume-open");
      dialog.showModal();
      closeRef.current?.focus();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const close = () => dialogRef.current?.close();
  const pdf = withBasePath(profile.resumeFile);
  const { width, height } = profile.resumePreviewSize;
  const fileLabel = profile.resumeDownloadName.toUpperCase();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="resume-title"
      className="resume-dialog"
      onClose={() => document.documentElement.classList.remove("resume-open")}
      // A click on the dimmed area around the window (the dialog itself, not the window) closes it.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="resume-panel flex h-full w-full flex-col overflow-hidden bg-panel sm:h-auto sm:max-h-full sm:max-w-[880px] sm:rounded-lg sm:border sm:border-line-strong sm:shadow-[0_24px_80px_rgb(0_0_0/0.55)]">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-led shadow-[0_0_8px_var(--led-glow)]" />
          <h2 id="resume-title" className="min-w-0 flex-1 truncate font-mono text-xs tracking-wide text-muted">
            <span className="text-ink">{fileLabel}</span>
            <span className="hidden sm:inline">
              {" · 1 PAGE · UPDATED "}
              {profile.resumeUpdated.toUpperCase()}
            </span>
          </h2>
          <a
            href={pdf}
            target="_blank"
            rel="noopener"
            className="hidden rounded-md border border-line-strong px-3.5 py-2 text-sm font-semibold text-ink no-underline hover:border-copper sm:inline-block"
          >
            Open in new tab
          </a>
          <a
            href={pdf}
            download={profile.resumeDownloadName}
            className="hidden rounded-md bg-copper px-3.5 py-2 text-sm font-semibold text-board no-underline hover:brightness-110 sm:inline-block"
          >
            Download PDF
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close résumé"
            className="-mr-1.5 grid size-9 shrink-0 place-items-center rounded-md text-muted hover:bg-line hover:text-ink"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
              <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="resume-scroll min-h-0 flex-1 overflow-auto p-3 sm:p-6">
          {/* The image only loads the first time the window opens (a closed dialog isn't rendered).
              A plain <img>: the site is a static export, so next/image has nothing to optimize. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath(profile.resumePreview)}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            alt={`Preview of ${profile.name}'s résumé. Use Download PDF for a copy with working links.`}
            className="mx-auto block h-auto w-full max-w-[820px] rounded-sm bg-white shadow-[0_8px_30px_rgb(0_0_0/0.45)]"
          />
        </div>

        <div className="flex gap-2 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
          <a
            href={pdf}
            download={profile.resumeDownloadName}
            className="flex-1 rounded-md bg-copper px-4 py-3 text-center text-[15px] font-semibold text-board no-underline"
          >
            Download PDF
          </a>
          <a
            href={pdf}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-line-strong px-4 py-3 text-[15px] font-semibold text-ink no-underline"
          >
            Open
          </a>
        </div>
      </div>
    </dialog>
  );
}
