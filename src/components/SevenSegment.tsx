// A seven-segment LED digit, like the ones on a calculator or a microwave.
// Segments are named a–g, going clockwise from the top, with g in the middle.

const SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abdeg",
  "3": "abcdg",
  "4": "bcfg",
  "5": "acdfg",
  "6": "acdefg",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  "-": "g",
  " ": "",
};

// Position and size of each segment inside a 34×50 digit.
const SHAPES: Record<string, string> = {
  a: "top-0 left-1 h-1 w-[18px]",
  b: "top-1 left-[22px] h-[19px] w-1",
  c: "top-[27px] left-[22px] h-[19px] w-1",
  d: "top-[46px] left-1 h-1 w-[18px]",
  e: "top-[27px] left-0 h-[19px] w-1",
  f: "top-1 left-0 h-[19px] w-1",
  g: "top-[23px] left-1 h-1 w-[18px]",
};

type Props = {
  char: string;
  point?: boolean;
  dim?: boolean;
  /** "led" glows red on a dark panel; "lcd" is dark segments on a multimeter's grey-green screen. */
  tone?: "led" | "lcd";
};

export function Digit({ char, point = false, dim = false, tone = "led" }: Props) {
  const lit = SEGMENTS[char] ?? "";
  const on = tone === "lcd" ? "bg-[#1b2418]" : dim ? "bg-led/30" : "bg-led";
  const off = tone === "lcd" ? "bg-black/[0.06]" : "bg-white/[0.06]";
  return (
    <span className="relative block h-[50px] w-[34px] flex-none">
      {Object.entries(SHAPES).map(([seg, cls]) => (
        <span key={seg} className={`absolute rounded-[2px] ${cls} ${lit.includes(seg) ? on : off}`} />
      ))}
      <span className={`absolute left-[29px] top-[46px] size-1 rounded-full ${point ? on : off}`} />
    </span>
  );
}

/** Splits a formatted number into digits, attaching each "." to the digit before it. */
export function toDigits(text: string): { char: string; point: boolean }[] {
  const out: { char: string; point: boolean }[] = [];
  for (const ch of text) {
    if (ch === "." && out.length) out[out.length - 1].point = true;
    else out.push({ char: ch, point: false });
  }
  return out;
}
