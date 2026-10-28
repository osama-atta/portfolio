"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { builds, projects, skillGroups, type Build, type Project, type SkillGroupId, type SkillId } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { PoweredSection } from "./circuit/PoweredSection";
import { POWER_LINE } from "./circuit/SpineProvider";

const skillLabel = new Map<string, string>(skillGroups.flatMap((g) => g.skills.map((s) => [s.id, s.label] as const)));
const groupSkills = new Map<SkillGroupId, SkillId[]>(skillGroups.map((g) => [g.id, g.skills.map((s) => s.id)]));
const allWork: (Project | Build)[] = [...projects, ...builds];

const POWER_INDEX = 3;
const HEADER_SPACE = 80; // room for the pinned header, plus a little air
const DOCK_SPACE = 150; // roughly how much of a phone screen the docked probe covers
const PULSE_MS = 1600;

/**
 * Scroll to a project card or build when the visitor asks for it (by clicking
 * its name in the probe). It lands just below the pinned header, unless that
 * would scroll far enough to power on the next section (Experience); then it
 * stops just short of that. Does nothing if the card is already on screen.
 * Runs after React has painted, so a just-opened dropdown can be measured.
 */
function scrollToWork(id: string, coveredBelow: number) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const el = document.getElementById(`project-${id}`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top >= HEADER_SPACE && r.bottom <= vh - coveredBelow) return;
      let top = window.scrollY + r.top - HEADER_SPACE;
      // The next section powers on when its branch reaches POWER_LINE down the screen; stay 24px above that.
      const next = document.querySelector<HTMLElement>(`[data-branch="${POWER_INDEX + 1}"]`);
      if (next) top = Math.min(top, window.scrollY + next.getBoundingClientRect().top - vh * POWER_LINE - 24);
      if (Math.abs(top - window.scrollY) < 4) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    }),
  );
}

/** What the visitor clicked: one skill, a whole group of them, or a project. */
type Selection =
  | { kind: "skill"; id: SkillId }
  | { kind: "group"; id: SkillGroupId }
  | { kind: "project"; id: string }
  | null;

/**
 * A board of skill "pads", grouped by area, above the work. Each group folds
 * open and closed (they start closed, so the section stays short). It works both ways:
 * - click a skill (or a group's count) to light up every project that used it;
 * - click a project to light up the pads it used (hovering previews it). Closed
 *   groups list their lit skills on their one-line preview.
 * Clicking never moves the page. Instead, the "probe" strip under the board
 * shows what the pick connects to: the projects and builds that use a skill, or
 * a project's skills. Clicking a project's name there scrolls to its card (the
 * only scroll, and only when asked). On phones the probe docks to the bottom of
 * the screen while something is picked and this section is on screen.
 * Featured projects get full cards; the rest sit in a "more builds" dropdown.
 */
export function SkillsAndWork() {
  const [active, setActive] = useState<string | null>(null); // hovered/focused project
  const [selected, setSelected] = useState<Selection>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<ReadonlySet<SkillGroupId>>(() => new Set());
  const [pulse, setPulse] = useState<string | null>(null); // the card just scrolled to, briefly outlined
  const [inView, setInView] = useState(false); // is this section on screen? (for the phone dock)
  const pulseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const openGroup = (ids: SkillGroupId[]) => setOpenGroups((cur) => new Set([...cur, ...ids]));
  const flipGroup = (id: SkillGroupId) =>
    setOpenGroups((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const anyOpen = openGroups.size > 0;

  // Track whether the section is on screen, so the phone's docked probe only shows while you're here.
  useEffect(() => {
    const section = document.getElementById("work");
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(section);
    return () => {
      observer.disconnect();
      clearTimeout(pulseTimer.current);
    };
  }, []);

  // If someone follows a link to a build in the dropdown (e.g. #project-telemetry), open it.
  useEffect(() => {
    const openForHash = () => {
      const id = window.location.hash.replace("#project-", "");
      if (builds.some((b) => b.id === id)) setMoreOpen(true);
    };
    const first = setTimeout(openForHash, 0);
    window.addEventListener("hashchange", openForHash);
    return () => {
      clearTimeout(first);
      window.removeEventListener("hashchange", openForHash);
    };
  }, []);

  const selectedWork = selected?.kind === "project" ? allWork.find((w) => w.id === selected.id) : undefined;
  const selectedSkills: SkillId[] | null = !selected
    ? null
    : selected.kind === "skill"
      ? [selected.id]
      : selected.kind === "group"
        ? (groupSkills.get(selected.id) ?? [])
        : (selectedWork?.skills ?? []);
  // Does this piece of work light up? A picked project lights only itself; a picked skill or group lights everything that uses it.
  const uses = (work: Project | Build) =>
    selected?.kind === "project" ? work.id === selected.id : selectedSkills !== null && work.skills.some((s) => selectedSkills.includes(s));

  // Hovering a project wins while you're on it; otherwise the selection shows.
  const hovered = active ? allWork.find((w) => w.id === active) : undefined;
  const litPads: readonly SkillId[] | null = hovered?.skills ?? selectedSkills;

  const matching = allWork.filter(uses).length;
  const matchingBuilds = builds.filter(uses).length;
  const selectedName = !selected
    ? ""
    : selected.kind === "skill"
      ? skillLabel.get(selected.id)
      : selected.kind === "group"
        ? skillGroups.find((g) => g.id === selected.id)?.label
        : selectedWork?.title;

  // Select (or unselect) something. The page doesn't move; the probe shows what it connects to.
  const toggle = (next: NonNullable<Selection>) => {
    const same = selected !== null && selected.kind === next.kind && selected.id === next.id;
    setSelected(same ? null : next);
    if (!same && next.kind === "group") openGroup([next.id]);
  };

  // From the probe: go to a project's card (opening the builds dropdown if it's in there) and outline it for a moment.
  const goToWork = (id: string) => {
    if (builds.some((b) => b.id === id)) setMoreOpen(true);
    const phone = window.matchMedia("(max-width: 639px)").matches;
    scrollToWork(id, phone ? DOCK_SPACE : 0);
    setPulse(id);
    clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setPulse(null), PULSE_MS);
  };

  // Projects preview their skills while a mouse hovers them or the keyboard focuses them, and pin
  // them on click/tap (or Enter/Space). Taps don't preview: a phone treats a tap as hovering and
  // focusing too, and that preview would keep the skills lit after a second tap unpins them.
  // Clicking also ends any preview, so unpinning with the mouse still over the card clears the board.
  const workProps = (id: string) => ({
    tabIndex: 0,
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === "mouse") setActive(id);
    },
    onPointerLeave: () => setActive(null),
    onFocus: (e: FocusEvent<HTMLElement>) => {
      if (e.currentTarget.matches(":focus-visible")) setActive(id); // keyboard focus only, not a click or tap
    },
    onBlur: () => setActive(null),
    onClick: (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) return; // let links inside a card work normally
      setActive(null);
      toggle({ kind: "project", id });
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      setActive(null);
      toggle({ kind: "project", id });
    },
  });

  // What the probe lists: for a skill or group, the work that uses it (click to go there);
  // for a project, its skills (click to probe that skill instead).
  const chips: { key: string; label: string; pre?: string; post?: string; strong: boolean; onClick: () => void }[] = !selected
    ? []
    : selected.kind === "project"
      ? (selectedWork?.skills ?? []).map((id) => ({
          key: id,
          label: skillLabel.get(id) ?? id,
          strong: false,
          onClick: () => toggle({ kind: "skill", id }),
        }))
      : [
          ...projects.filter(uses).map((p) => ({ key: p.id, label: p.title, pre: p.tag.slice(0, 2), strong: true, onClick: () => goToWork(p.id) })),
          ...builds.filter(uses).map((b) => ({ key: b.id, label: b.title, post: "build", strong: false, onClick: () => goToWork(b.id) })),
        ];
  const featuredMatches = projects.filter(uses).length;
  const probeSub = !selected
    ? "Pick a skill or a project to see what it connects to."
    : selected.kind === "project"
      ? `Uses ${chips.length} ${chips.length === 1 ? "skill" : "skills"}, lit on the board`
      : matching
        ? `Used in ${featuredMatches} featured ${featuredMatches === 1 ? "project" : "projects"} and ${matchingBuilds} more ${matchingBuilds === 1 ? "build" : "builds"}`
        : "Not in a project on this page yet";

  const probe = (variant: "inline" | "dock") => {
    const dock = variant === "dock";
    return (
      <div
        role="status"
        className={
          dock
            ? "fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t border-line-strong bg-board/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_24px_-10px_rgb(0_0_0/0.85)] backdrop-blur-md"
            : `flex flex-col gap-2.5 rounded-[10px] border bg-board px-4 py-3 transition-colors duration-200 ${selected ? "border-line-strong" : "border-line"}`
        }
      >
        <div className="flex min-h-7 items-center gap-2.5 font-mono text-xs tracking-[0.08em]">
          <span
            aria-hidden="true"
            className={`size-2 flex-none rounded-full transition-all duration-200 ${selected ? "bg-led shadow-[0_0_8px_var(--color-led)]" : "bg-line-strong"}`}
          />
          <span className="text-copper">PROBE</span>
          {selected && (
            <>
              <span aria-hidden="true" className="text-line-strong">
                ·
              </span>
              <span className="truncate uppercase text-ink">{selectedName}</span>
            </>
          )}
          {!dock && <span className="truncate font-sans text-[13px] tracking-normal text-dim">{probeSub}</span>}
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Clear the probe"
              className="ml-auto min-h-8 flex-none cursor-pointer rounded border-0 bg-transparent px-1.5 font-mono text-xs text-dim hover:text-ink"
            >
              ✕{dock ? "" : " CLEAR"}
            </button>
          )}
        </div>
        {dock && <p className="m-0 text-[13px] text-muted">{probeSub}</p>}
        {chips.length > 0 && (
          <ul className={`m-0 flex list-none gap-2 p-0 ${dock ? "-mx-4 overflow-x-auto px-4 pb-0.5" : "flex-wrap"}`}>
            {chips.map((c) => (
              <li key={c.key} className="flex-none">
                <button
                  type="button"
                  onClick={c.onClick}
                  className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 font-mono text-xs transition-colors hover:border-copper ${
                    c.strong ? "border-copper/70 bg-copper/10 text-ink" : "border-line-strong bg-pad text-soft"
                  }`}
                >
                  {c.pre && <span className="text-copper">{c.pre}</span>}
                  {c.label}
                  {c.post && <span className="text-dim">· {c.post}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <PoweredSection index={3} id="work" className="flex flex-col gap-6">
      <SectionHeading eyebrow="A3 · Skill matrix" title="Skills & Projects" badgeFor={3} />

      <div className="flex flex-col gap-4 rounded-[14px] border border-line bg-panel p-4 sm:p-6">
        <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-[15px] text-muted">
            Open a group to see its skills. Click a skill, or a group&rsquo;s count, to see the work that uses it.
          </p>
          <span className="flex gap-2">
            {/* Always takes up its space (just hidden when nothing is picked), so showing it never shifts the board. */}
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-hidden={!selected}
              tabIndex={selected ? undefined : -1}
              className={`min-h-10 rounded-md border border-line-strong bg-pad px-3.5 font-mono text-sm text-ink hover:border-copper ${selected ? "" : "invisible"}`}
            >
              ✕ Clear
            </button>
            <button
              type="button"
              onClick={() => setOpenGroups(anyOpen ? new Set() : new Set(skillGroups.map((g) => g.id)))}
              // On phones this comes first, on the left; Clear appears to its right when something is picked.
              className="min-h-10 rounded-md border border-line-strong bg-pad px-3.5 font-mono text-sm text-ink hover:border-copper max-sm:order-first"
            >
              {anyOpen ? "▸ Close all" : "▾ Open all"}
            </button>
          </span>
        </div>

        {/* grid-cols-1 on phones too: without a set column width, a closed group's long line of lit skills would stretch the column off the screen instead of being cut off with "…". */}
        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => {
            const groupOn = selected?.kind === "group" && selected.id === group.id;
            const open = openGroups.has(group.id);
            const lit = group.skills.filter((s) => litPads?.includes(s.id));
            const panelId = `skills-${group.id}`;
            return (
              <div
                key={group.id}
                className={`flex min-w-0 flex-col rounded-[10px] border bg-pad px-3.5 transition-[border-color,box-shadow] duration-200 ${
                  "wide" in group && group.wide ? "col-span-full" : ""
                } ${groupOn ? "border-copper shadow-[0_0_18px_-6px_var(--color-copper)]" : open ? "border-line-strong" : "border-line"} ${
                  open ? "pb-4" : "pb-2.5"
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* The group's name opens and closes it. */}
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => flipGroup(group.id)}
                    className={`flex min-h-11 flex-1 cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-left font-mono text-xs uppercase tracking-[0.1em] hover:text-copper ${
                      groupOn ? "text-copper" : "text-muted"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`size-0 flex-none border-x-[5px] border-t-[7px] border-x-transparent border-t-copper transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
                    />
                    {/* A lit LED when something in this group is lit, so you can tell even when it's closed. It sits
                        inline after the last word, so it stays next to the name when a long name wraps onto two lines. */}
                    <span>
                      {/* The last word and the LED never wrap apart, so the LED can't end up on a line by itself. */}
                      {group.label.slice(0, group.label.lastIndexOf(" ") + 1)}
                      <span className="whitespace-nowrap">
                        {group.label.slice(group.label.lastIndexOf(" ") + 1)}
                        {lit.length > 0 && (
                          <span aria-hidden="true" className="ml-2 inline-block size-2 rounded-full bg-led align-middle shadow-[0_0_8px_var(--color-led)]" />
                        )}
                      </span>
                    </span>
                  </button>
                  {/* The count lights up everything in the group. */}
                  <button
                    type="button"
                    aria-pressed={groupOn}
                    aria-label={`Light up everything in ${group.label} (${group.skills.length} skills)`}
                    title={`Light up everything in ${group.label}`}
                    onClick={() => toggle({ kind: "group", id: group.id })}
                    className={`min-h-8 min-w-8 cursor-pointer rounded-full border px-2 font-mono text-xs transition-colors ${
                      groupOn ? "border-copper bg-copper text-board" : "border-line-strong bg-transparent text-dim hover:border-copper hover:text-copper"
                    }`}
                  >
                    {group.skills.length}
                  </button>
                </div>
                {/* One line, always the same height (long text is cut off with "…"), so hovering a project never moves the page. */}
                {!open && (
                  <p className="m-0 -mt-1 truncate pl-[22px] text-[13px] leading-5 text-dim">
                    {lit.length > 0 ? (
                      <span className="text-copper">
                        <span aria-hidden="true" className="mr-1.5 inline-block size-[7px] rounded-full bg-led align-middle shadow-[0_0_6px_var(--color-led)]" />
                        {lit.map((s) => s.label).join(" · ")}
                      </span>
                    ) : (
                      <>
                        {group.skills[0].label} · +{group.skills.length - 1} more
                      </>
                    )}
                  </p>
                )}
                <ul id={panelId} hidden={!open} className="m-0 mt-1.5 flex list-none flex-wrap gap-2 p-0">
                  {group.skills.map((s) => {
                    const on = litPads?.includes(s.id) ?? false;
                    const dim = litPads !== null && !on;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          aria-pressed={selected?.kind === "skill" && selected.id === s.id}
                          onClick={() => toggle({ kind: "skill", id: s.id })}
                          className={[
                            // Top-aligned and left-aligned, so a long name that wraps on a phone reads like a bulleted line with
                            // the LED beside its first line. The padding keeps one-line pads 36px tall, as before.
                            "inline-flex min-h-9 cursor-pointer items-start gap-2 rounded-md border px-2.5 py-[7.25px] text-left font-mono text-[13px] transition-all duration-200",
                            on
                              ? "border-copper bg-copper text-board shadow-[0_0_14px_var(--color-copper)]"
                              : dim
                                ? "border-[#173126] bg-pad text-dim hover:text-[#d5e3db]"
                                : "border-line-strong bg-pad text-[#d5e3db] hover:border-copper",
                          ].join(" ")}
                        >
                          <span
                            aria-hidden="true"
                            className={`mt-[5.75px] size-2 flex-none rounded-full transition-all duration-200 ${on ? "bg-led shadow-[0_0_8px_var(--color-led)]" : "bg-line-strong"}`}
                          />
                          <span>{s.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* The probe: inline under the board from 640px up. On phones it docks to the bottom instead (below). */}
        <div className="max-sm:hidden">{probe("inline")}</div>
      </div>
      {inView && selected && createPortal(<div className="sm:hidden">{probe("dock")}</div>, document.body)}

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="m-0 font-mono text-[13px] font-normal uppercase tracking-[0.1em] text-copper">Featured</h3>
        <span className="text-sm text-dim">The six projects worth a closer look</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-[18px]">
        {projects.map((p) => {
          const usesSelected = uses(p);
          const dimmed = selected !== null && !usesSelected && active !== p.id;
          const highlighted = active === p.id || usesSelected || pulse === p.id;
          return (
            <article
              key={p.id}
              id={`project-${p.id}`}
              {...workProps(p.id)}
              className={`relative flex scroll-mt-24 cursor-pointer flex-col gap-2.5 rounded-[14px] border-2 bg-panel p-6 transition-all duration-300 target:border-copper target:shadow-[0_0_0_2px_var(--color-copper),0_0_28px_-6px_var(--color-copper)] ${
                highlighted ? "border-copper" : "border-line"
              } ${
                pulse === p.id
                  ? "shadow-[0_0_0_2px_var(--color-copper),0_0_28px_-6px_var(--color-copper)]"
                  : usesSelected
                    ? "shadow-[0_0_24px_-8px_var(--color-copper)]"
                    : ""
              } ${dimmed && pulse !== p.id ? "opacity-40" : "opacity-100"}`}
            >
              {/* Status LED: lights when this project uses the selected skill. */}
              <span
                aria-hidden="true"
                className={`absolute right-5 top-5 size-2.5 rounded-full transition-all duration-300 ${
                  usesSelected ? "bg-led shadow-[0_0_10px_var(--color-led)]" : "bg-line-strong"
                }`}
              />
              <span className="pr-6 font-mono text-[13px] text-muted">{p.tag}</span>
              <h4 className="m-0 text-[20px] font-semibold leading-snug">{p.title}</h4>
              <p className="m-0 text-[15px] leading-relaxed text-muted">{p.description}</p>
              <p className="m-0 mt-auto pt-1 text-[15px] font-semibold">Result: {p.result}</p>
              <SkillList ids={p.skills} selected={selectedSkills} />
              {p.href && (
                <a href={p.href} className="pt-1.5 text-[15px] font-semibold text-copper no-underline hover:underline">
                  Read case study →
                </a>
              )}
            </article>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls="more-builds"
          onClick={() => setMoreOpen((o) => !o)}
          className={`mt-2 flex min-h-14 w-full cursor-pointer flex-wrap items-center gap-x-3.5 gap-y-2 rounded-xl border bg-panel px-5 py-3 text-left text-ink transition-colors duration-200 hover:border-copper ${
            matchingBuilds && !moreOpen ? "border-copper" : "border-line"
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-0 border-x-[6px] border-t-8 border-x-transparent border-t-copper transition-transform duration-200 ${moreOpen ? "" : "-rotate-90"}`}
          />
          <span className="font-mono text-[13px] uppercase tracking-[0.1em] text-copper">
            {moreOpen ? "Hide" : "Show"} {builds.length} more builds
          </span>
          <span className="text-sm text-dim">Telemetry, the GitHub migration, the UX initiative, hardware and more</span>
          {matchingBuilds > 0 && (
            <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-copper/15 px-2.5 py-1 font-mono text-xs text-copper">
              <span aria-hidden="true" className="size-[7px] rounded-full bg-led shadow-[0_0_6px_var(--color-led)]" />
              {matchingBuilds} {matchingBuilds === 1 ? "matches" : "match"} your pick
            </span>
          )}
        </button>

        <ul
          id="more-builds"
          hidden={!moreOpen}
          className="m-0 list-none rounded-[14px] border border-line bg-panel px-5 py-1.5 sm:px-6 md:grid md:grid-cols-2 md:gap-x-7"
        >
          {builds.map((b) => {
            const usesSelected = uses(b);
            const highlighted = active === b.id || usesSelected || pulse === b.id;
            const dimmed = selected !== null && !usesSelected && active !== b.id && pulse !== b.id;
            return (
              <li
                key={b.id}
                id={`project-${b.id}`}
                {...workProps(b.id)}
                className={`grid scroll-mt-24 cursor-pointer grid-cols-[12px_minmax(0,1fr)_auto] items-start gap-x-3.5 rounded-md border-b border-line py-4 transition-[opacity,box-shadow] duration-300 ${
                  dimmed ? "opacity-40" : "opacity-100"
                } ${pulse === b.id ? "shadow-[0_0_0_2px_var(--color-copper)]" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-1.5 size-2.5 rounded-full transition-all duration-300 ${
                    usesSelected ? "bg-led shadow-[0_0_10px_var(--color-led)]" : "bg-line-strong"
                  }`}
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className={`font-semibold ${highlighted ? "text-copper" : "text-ink"}`}>{b.title}</span>
                  <span className="text-sm text-muted">{b.note}</span>
                  <span className="sr-only">Uses: {b.skills.map((id) => skillLabel.get(id)).join(", ")}</span>
                </span>
                <span className="whitespace-nowrap pt-0.5 font-mono text-xs text-dim">{b.years}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </PoweredSection>
  );
}

function SkillList({ ids, selected }: { ids: SkillId[]; selected: SkillId[] | null }) {
  return (
    <p className="m-0 font-mono text-xs leading-relaxed text-dim">
      Uses:{" "}
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && " · "}
          <span className={selected?.includes(id) ? "text-copper" : undefined}>{skillLabel.get(id)}</span>
        </span>
      ))}
    </p>
  );
}
