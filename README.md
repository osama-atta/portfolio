# Osama Atta · Portfolio

A circuit board you can scroll. The OA-2026 chip in the logo feeds one copper "spine" that runs down the page. As you scroll, current flows along it and each section powers on when the current reaches its branch: the LED display starts flashing messages, the test points measure your impact numbers one by one on seven-segment displays, and the experience LEDs light in sequence. Clicking a skill lights up the work that used it, and clicking a project lights up its skills.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript** and **Tailwind CSS v4**, exported as a static site and deployed to **GitHub Pages**.

## Run it locally

You need [Node.js 22](https://nodejs.org) or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Edits show up instantly.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the static site into `out/` |
| `npm run preview` | Serves `out/` so you can check the production build |
| `npm run lint` | Runs ESLint |

## Edit the content

Almost everything the site says lives in **`src/data/content.ts`**: your intro, the LED messages, metrics, skills, projects, experience and education. Change it there and every component picks it up.

- **LED messages:** `ledFrames` takes up to two lines per message. The display sizes itself to the longest line. Visitors can step through them (tap or swipe the screen, the ◀ ▶ buttons, the arrow keys, or one of the message LEDs); a picked message stays up for `MANUAL_HOLD_MS` in `LedModule.tsx` before the sign carries on.
- **Skills and work:** `skillGroups` holds the skill pads, grouped by area (set `wide: true` for a group that spans the full row). `projects` are the six featured cards; `builds` are the one-line entries in the "more builds" dropdown. Each lists the skill IDs it used: those decide which pads light up on hover, and which work lights up when a skill or a whole group is clicked.
- **What I'm working on now:** `nowItems` holds the four channels. A `counter` with `kind: "since"` counts months from a date (time in role); `kind: "until"` counts down to one (the certificate). They're worked out in the visitor's browser, so they stay current without redeploying.
- **Probe readouts:** each metric has a `probe` block (what was measured, role, dates, and the `projectId` its "Trace it to the project" link jumps to).
- **Case studies:** add an `href` to a project and a "Read case study →" link appears on its card.
- **Résumé:** drop your PDF at `public/resume.pdf`. The Résumé buttons already point there.

Colors and fonts are design tokens in **`src/app/globals.css`** (`--color-copper`, `--color-led`, …). Tailwind turns them into classes like `bg-panel` and `text-copper`.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which lints, builds and publishes to GitHub Pages.

One-time setup: in the repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.

The site will be at `https://osama-atta.github.io/portfolio/`. If you later rename the repo to `osama-atta.github.io`, or add a custom domain, the workflow serves it from the root automatically.

## How it's put together

```
src/
  app/
    layout.tsx         Fonts, metadata, <html>/<body>
    page.tsx           The page: stacks the sections in order
    globals.css        Tailwind import + design tokens
  components/
    circuit/
      SpineProvider.tsx  The spine: tracks scroll, fills the trace, decides which sections have power
      PoweredSection.tsx A section wired to the spine (branch, standby/powered look, POWERED badge)
    BootScreen.tsx     The start-up screen shown on first load
    ChipLogo.tsx       The OA chip logo the spine starts from
    DisplayModule.tsx  LED sign mounted on the board (bus 0)
    LedModule.tsx      The display module with its MSG/GAME switch, score and lives
    LedDisplay.tsx     The flashing dot-matrix sign (client component)
    BrickBreaker.tsx   Brick breaker played on the same LED grid (canvas + game loop)
    NowSection.tsx     "What I'm working on now": live channels with blinking activity LEDs and month counters
    Metrics.tsx        Impact test points (not on the page right now; swap it back in page.tsx)
    ProbeReadout.tsx   The multimeter readout that explains a probed number
    SevenSegment.tsx   A single seven-segment digit
    SkillsAndWork.tsx  Grouped skill pads, featured cards and a "more builds" dropdown: click a skill or group to light its work, hover work to light its skills
    Experience.tsx     Roles whose LEDs light in sequence when powered
    Header, Hero, Contact, SectionHeading
  data/content.ts      All the words and numbers
  hooks/usePrefersReducedMotion.ts
  lib/ledFont.ts       5×7 LED font and frame layout math
```

### React and Next.js concepts used here

A good order to read the code in if you're coming from Angular:

1. **Server vs. client components.** Files are server components by default: rendered at build time, no JavaScript shipped. Files starting with `"use client"` (`SpineProvider`, `PoweredSection`, `LedDisplay`, `Metrics`, `Experience`, `SkillsAndWork`) run in the browser because they need state or effects. In Angular terms, everything is static until you opt in.
2. **`useState`** holds data that re-renders the component when it changes: the LED's current frame, the counter's progress, the hovered project. It's like a component field that triggers change detection.
3. **`useEffect`** runs side effects after render and returns a cleanup function, like `ngOnInit` + `ngOnDestroy` in one. See the timers in `LedDisplay`, the `IntersectionObserver` in `Metrics`, and the scroll listener in `TraceSvg`.
4. **`useRef`** reaches a real DOM node (the SVG whose paths animate), like `@ViewChild`.
5. **`useMemo` / `useCallback`** cache work between renders, like the LED layout math.
6. **Custom hooks.** `usePrefersReducedMotion` and `usePower` package reusable logic, the React equivalent of a small injectable service.
7. **Context.** `SpineProvider` shares "which sections have power" with every section through React context, much like a service provided at a parent component in Angular. Any component can call `usePower(index)` to ask whether it's on.
8. **Props and composition.** Components are plain functions that take props, e.g. `<PoweredSection index={2}>`, much like `@Input()`.

To add a new section to the spine, wrap it in `<PoweredSection index={n}>` and keep the indexes in page order.

### The boot screen

On a visitor's first load in a browser session, `BootScreen.tsx` covers the page with a short start-up log and a progress bar, then fades out. Only then does the spine start carrying current: it creeps down from the chip (`RAMP_DELAY_MS` and `RAMP_SPEED` in `SpineProvider.tsx`), so the LED display flickers on first and the rest follows. Any key, click, tap or scroll skips it. Later loads in the same session skip straight to the power-up (an inline script in `layout.tsx` checks `sessionStorage`), and it never shows for visitors who prefer reduced motion or have JavaScript off. Change the log lines and timings at the top of `BootScreen.tsx`.

### The brick breaker easter egg

Flip the **MSG / GAME** switch under the LED display to play. Move with the mouse, a finger or ← →, launch with a click or Space, and press Esc to leave. The game state lives in a `useRef` and a `requestAnimationFrame` loop draws it on a `<canvas>`, because updating React state 60 times a second would re-render the page constantly. Only the score, lives and status go back to React. Tweak the feel with the constants at the top of `BrickBreaker.tsx` (`START_SPEED`, `PADDLE_W`, `BRICK_ROWS`, …).

### Accessibility

- Every themed label sits above a plain-English heading.
- Animations turn off when the visitor's OS asks for reduced motion, and every section shows fully powered.
- The LED sign and seven-segment digits are decorative. The real text and numbers are in the page for screen readers.
- Project cards are keyboard-focusable, and focusing one lights its skills just like hovering.

## Ideas for next steps

- Case-study pages: `src/app/projects/[slug]/page.tsx` with `generateStaticParams`.
- An "Ask my résumé" chatbot (needs a small API, e.g. a serverless function).
- An English/Arabic toggle with right-to-left layout.
