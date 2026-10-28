// A classic 5×7 dot-matrix font and the math that turns text into lit LEDs.
// Each glyph is 7 rows of 5 bits ("1" = LED on).

const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "10001", "11001", "10101", "10011", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "·": ["00000", "00000", "00100", "01110", "00100", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  "/": ["00001", "00001", "00010", "00100", "01000", "10000", "10000"],
  "'": ["01100", "00100", "01000", "00000", "00000", "00000", "00000"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "%": ["11000", "11001", "00010", "00100", "01000", "10011", "00011"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
};

const GLYPH_ROWS = 7;
const GLYPH_COLS = 5;

/** A horizontal run of lit LEDs, positioned in percent of the panel. */
export type LedRun = {
  left: number;
  top: number;
  width: number;
  height: number;
  /** background-size for one dot inside the run, in % of the run's width */
  dotSize: number;
};

export type LedLayout = {
  cols: number;
  rows: number;
  frames: LedRun[][];
};

function glyphColumns(text: string): boolean[][] {
  const cols: boolean[][] = [];
  for (const ch of text.toUpperCase()) {
    const glyph = FONT[ch] ?? FONT[" "];
    for (let c = 0; c < GLYPH_COLS; c++) {
      cols.push(glyph.map((row) => row[c] === "1"));
    }
    cols.push(new Array(GLYPH_ROWS).fill(false)); // 1-column gap between letters
  }
  cols.pop();
  return cols;
}

/** Render up to two centered lines of text onto a cols × rows grid of LEDs (true = lit). */
export function textToGrid(lines: string[], cols: number, rows: number): boolean[][] {
  const grid = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const shown = lines.slice(0, 2);
  const tops = shown.length > 1 ? [1, rows - 8] : [Math.floor((rows - GLYPH_ROWS) / 2)];
  shown.forEach((line, li) => {
    const bits = glyphColumns(line);
    const startCol = Math.floor((cols - bits.length) / 2);
    bits.forEach((column, x) => {
      column.forEach((on, r) => {
        const gx = startCol + x;
        const gy = tops[li] + r;
        if (on && gx >= 0 && gx < cols && gy >= 0 && gy < rows) grid[gy][gx] = true;
      });
    });
  });
  return grid;
}

/**
 * Lay out every frame on one shared grid, sized to fit the longest line.
 * Lit LEDs are merged into horizontal runs so a frame renders with a few
 * hundred elements instead of thousands of individual dots.
 */
export function layoutFrames(frames: string[][]): LedLayout {
  const longest = Math.max(1, ...frames.flat().map((line) => line.length));
  const twoLine = frames.some((f) => f.length > 1);
  const cols = longest * (GLYPH_COLS + 1) - 1 + 4; // 2 blank columns each side
  const rows = twoLine ? 18 : 9;

  const laidOut = frames.map((lines) => {
    const tops = lines.length > 1 ? [1, 10] : [Math.floor((rows - GLYPH_ROWS) / 2)];
    const runs: LedRun[] = [];
    lines.slice(0, 2).forEach((line, li) => {
      const bits = glyphColumns(line);
      const startCol = Math.floor((cols - bits.length) / 2);
      for (let r = 0; r < GLYPH_ROWS; r++) {
        let runStart = -1;
        for (let x = 0; x <= bits.length; x++) {
          const on = x < bits.length && bits[x][r];
          if (on && runStart < 0) runStart = x;
          if (!on && runStart >= 0) {
            const len = x - runStart;
            runs.push({
              left: ((startCol + runStart) / cols) * 100,
              top: ((tops[li] + r) / rows) * 100,
              width: (len / cols) * 100,
              height: (1 / rows) * 100,
              dotSize: 100 / len,
            });
            runStart = -1;
          }
        }
      }
    });
    return runs;
  });

  return { cols, rows, frames: laidOut };
}
