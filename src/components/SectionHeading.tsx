import { PowerBadge } from "./circuit/PoweredSection";

type Props = {
  eyebrow: string;
  title: string;
  /** Show a POWERED/STANDBY badge for this section index. */
  badgeFor?: number;
};

/** A small mono "themed" label above a plain-English heading, so everyone can read it. */
export function SectionHeading({ eyebrow, title, badgeFor }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="inline-flex flex-wrap items-center gap-2.5 font-mono text-sm text-copper">
        {eyebrow}
        {badgeFor !== undefined && <PowerBadge index={badgeFor} />}
      </span>
      <h2 className="m-0 font-display text-4xl font-bold">{title}</h2>
    </div>
  );
}
