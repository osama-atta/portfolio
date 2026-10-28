"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { builds, projects, skillGroups, type Build, type Project, type SkillGroupId, type SkillId } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { PoweredSection } from "./circuit/PoweredSection";

const skillLabel = new Map<string, string>(skillGroups.flatMap((g) => g.skills.map((s) => [s.id, s.label] as const)));
const groupSkills = new Map<SkillGroupId, SkillId[]>(skillGroups.map((g) => [g.id, g.skills.map((s) => s.id)]));
const allWork: (Project | Build)[] = [...projects, ...builds];

/**
 * Scroll `el` into view if it isn't comfortably on screen already. Runs after
 * React has painted the new state, so a just-opened dropdown can be scrolled to.
 */
function reveal(getEl: () => HTMLElement | null, fits: (r: DOMRect, vh: number) => boolean) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const el = getEl();
      if (!el || fits(el.getBoundingClientRect(), window.innerHeight)) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
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
 * A board of skill "pads", grouped by area, above the work. It works both ways:
 * - click a skill (or a group's name) to light up every project that used it;
 * - click a project to light up the pads it used (hovering previews it).
 * Featured projects get full cards; the rest sit in a "more builds" dropdown.
 */
export function SkillsAndWork() {
  const [active, setActive] = useState<string | null>(null); // hovered/focused project
  const [selected, setSelected] = useState<Selection>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

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

  // Select (or unselect) something, then scroll to what it lit up: picking a
  // skill or group scrolls to the first project that uses it, and picking a
  // project scrolls back up to the skill board.
  const toggle = (next: NonNullable<Selection>) => {
    const same = selected !== null && selected.kind === next.kind && selected.id === next.id;
    setSelected(same ? null : next);
    if (same) return;

    if (next.kind === "project") {
      reveal(() => boardRef.current, (r, vh) => r.top >= 0 && r.bottom <= vh);
      return;
    }
    const picked: SkillId[] = next.kind === "skill" ? [next.id] : (groupSkills.get(next.id) ?? []);
    const usesPicked = (w: Project | Build) => w.skills.some((s) => picked.includes(s));
    const first = projects.find(usesPicked) ?? builds.find(usesPicked);
    if (!first) return;
    if (builds.includes(first as Build)) setMoreOpen(true);
    reveal(() => document.getElementById(`project-${first.id}`), (r, vh) => r.top >= 80 && r.bottom <= vh);
  };

  // Projects preview their skills on hover/focus, and pin them on click (or Enter/Space).
  const workProps = (id: string) => ({
    tabIndex: 0,
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(id),
    onBlur: () => setActive(null),
    onClick: (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) return; // let links inside a card work normally
      toggle({ kind: "project", id });
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      toggle({ kind: "project", id });
    },
  });

  return (
    <PoweredSection index={3} id="work" className="flex flex-col gap-6">
      <SectionHeading eyebrow="A2 · Skill matrix" title="Skills & Projects" badgeFor={3} />

      <div ref={boardRef} className="flex scroll-mt-6 flex-col gap-4 rounded-[14px] border border-line bg-panel p-4 sm:p-6">
        <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-[15px] text-muted" aria-live="polite">
            {selected?.kind === "project" ? (
              <>
                <span className="font-semibold text-copper">{selectedName}</span> uses{" "}
                {selectedSkills?.length === 1 ? "1 skill" : `${selectedSkills?.length ?? 0} skills`}, lit up below.
              </>
            ) : selected ? (
              matching ? (
                <>
                  <span className="font-semibold text-copper">{selectedName}</span> shows up in{" "}
                  {matching === 1 ? "1 project" : `${matching} projects`} below.
                </>
              ) : (
                <>
                  <span className="font-semibold text-copper">{selectedName}</span> isn&rsquo;t in a project below yet.
                </>
              )
            ) : (
              "Click a skill or a group to light up the work that uses it, or click a project to see its skills."
            )}
          </p>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="min-h-10 rounded-md border border-line-strong bg-pad px-3.5 font-mono text-sm text-ink hover:border-copper"
            >
              ✕ Clear
            </button>
          )}
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => {
            const groupOn = selected?.kind === "group" && selected.id === group.id;
            return (
              <div
                key={group.id}
                className={`flex flex-col gap-3 rounded-[10px] border bg-pad px-3.5 pb-4 pt-3 transition-all duration-200 ${
                  "wide" in group && group.wide ? "col-span-full" : ""
                } ${groupOn ? "border-copper shadow-[0_0_18px_-6px_var(--color-copper)]" : "border-line"}`}
              >
                <button
                  type="button"
                  aria-pressed={groupOn}
                  title={`Light up everything in ${group.label}`}
                  onClick={() => toggle({ kind: "group", id: group.id })}
                  className={`flex min-h-8 cursor-pointer items-center justify-between gap-2 border-0 bg-transparent p-0 text-left font-mono text-xs uppercase tracking-[0.1em] hover:text-copper ${
                    groupOn ? "text-copper" : "text-muted"
                  }`}
                >
                  <span>{group.label}</span>
                  <span className="text-dim">{group.skills.length}</span>
                </button>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
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
                            "inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-[13px] transition-all duration-200",
                            on
                              ? "border-copper bg-copper text-board shadow-[0_0_14px_var(--color-copper)]"
                              : dim
                                ? "border-[#173126] bg-pad text-dim hover:text-[#d5e3db]"
                                : "border-line-strong bg-pad text-[#d5e3db] hover:border-copper",
                          ].join(" ")}
                        >
                          <span
                            aria-hidden="true"
                            className={`size-2 rounded-full transition-all duration-200 ${on ? "bg-led shadow-[0_0_8px_var(--color-led)]" : "bg-line-strong"}`}
                          />
                          {s.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="m-0 font-mono text-[13px] font-normal uppercase tracking-[0.1em] text-copper">Featured</h3>
        <span className="text-sm text-dim">The six projects worth a closer look</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-[18px]">
        {projects.map((p) => {
          const usesSelected = uses(p);
          const dimmed = selected !== null && !usesSelected && active !== p.id;
          const highlighted = active === p.id || usesSelected;
          return (
            <article
              key={p.id}
              id={`project-${p.id}`}
              {...workProps(p.id)}
              className={`relative flex scroll-mt-24 cursor-pointer flex-col gap-2.5 rounded-[14px] border-2 bg-panel p-6 transition-all duration-300 target:border-copper target:shadow-[0_0_0_2px_var(--color-copper),0_0_28px_-6px_var(--color-copper)] ${
                highlighted ? "border-copper" : "border-line"
              } ${usesSelected ? "shadow-[0_0_24px_-8px_var(--color-copper)]" : ""} ${dimmed ? "opacity-40" : "opacity-100"}`}
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
            const highlighted = active === b.id || usesSelected;
            const dimmed = selected !== null && !usesSelected && active !== b.id;
            return (
              <li
                key={b.id}
                id={`project-${b.id}`}
                {...workProps(b.id)}
                className={`grid scroll-mt-24 cursor-pointer grid-cols-[12px_minmax(0,1fr)_auto] items-start gap-x-3.5 border-b border-line py-4 transition-opacity duration-300 ${
                  dimmed ? "opacity-40" : "opacity-100"
                }`}
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
          <span className={selected?.includes(id) ? "font-semibold text-copper" : undefined}>{skillLabel.get(id)}</span>
        </span>
      ))}
    </p>
  );
}
