import { profile } from "@/data/content";
import { withBasePath } from "@/lib/basePath";
import { ChipLogo } from "./ChipLogo";

const NAV = [
  { href: "#now", label: "Now" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-[22px]">
      <a href="#top" className="inline-flex items-center gap-4 font-display text-[22px] font-bold text-ink no-underline">
        <ChipLogo />
        <span className="flex flex-col gap-0.5">
          <span>{profile.name}</span>
          <span className="font-mono text-xs font-normal text-[#8fa89b]">U1</span>
        </span>
      </a>
      {/* Indented on small screens so the wrapped nav doesn't sit on top of the spine. */}
      <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 pl-[calc(var(--rail)+20px)] text-[15px] font-medium lg:pl-0">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="px-3 py-3 text-soft no-underline hover:text-ink">
            {item.label}
          </a>
        ))}
        <a
          href={withBasePath(profile.resumeFile)}
          className="rounded-md bg-copper px-[18px] py-3 font-semibold text-board no-underline hover:brightness-110"
        >
          Résumé
        </a>
      </nav>
    </header>
  );
}
