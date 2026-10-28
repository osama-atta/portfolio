// The OA-2026 chip used as the logo. Its bottom-center pin (x = 32 of 64)
// sits exactly on the spine, which starts right below it.
// Traces leave the three top pins and fan out above the chip to vias; they
// draw themselves once the boot screen finishes (see .trace-draw in globals.css).

const PINS = [20, 30, 40];

// Drawn in the chip's 64-unit coordinate space; negative y is above the chip.
const TOP_TRACES: { d: string; via: [number, number] }[] = [
  { d: "M22 2 V-5 L13 -14 H-2", via: [-2, -14] },
  { d: "M32 2 V-15", via: [32, -15] },
  { d: "M42 2 V-5 L51 -14 H72", via: [72, -14] },
];

export function ChipLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      overflow="visible"
      className="block flex-none overflow-visible"
      style={{ width: "var(--rail)", height: "var(--rail)" }}
    >
      <g fill="none" stroke="var(--color-copper)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {TOP_TRACES.map((t, i) => (
          <path key={t.d} d={t.d} pathLength={1} className="trace-draw" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </g>
      <g fill="var(--color-board)" stroke="var(--color-copper)" strokeWidth={1.5}>
        {TOP_TRACES.map(({ via: [cx, cy] }, i) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.6} className="via-pop" style={{ animationDelay: `${600 + i * 120}ms` }} />
        ))}
      </g>
      <g fill="var(--color-copper)">
        {PINS.map((p) => (
          <rect key={`t${p}`} x={p} y={2} width={4} height={10} />
        ))}
        {PINS.map((p) => (
          <rect key={`b${p}`} x={p} y={52} width={4} height={p === 30 ? 12 : 10} />
        ))}
        {PINS.map((p) => (
          <rect key={`l${p}`} x={2} y={p} width={10} height={4} />
        ))}
        {PINS.map((p) => (
          <rect key={`r${p}`} x={52} y={p} width={10} height={4} />
        ))}
      </g>
      <rect x={11} y={11} width={42} height={42} rx={4} fill="var(--color-module)" stroke="var(--color-line-strong)" strokeWidth={2} />
      <circle cx={18} cy={18} r={2.5} fill="none" stroke="#5e7a6c" strokeWidth={1.5} />
      <circle cx={45} cy={45} r={2.5} className="chip-led" />
      <text x={32} y={37} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={13} fontWeight={500} fill="var(--color-ink)">
        OA
      </text>
    </svg>
  );
}
