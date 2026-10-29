# Osama Atta · Portfolio

A circuit board you can scroll. The OA-2026 chip in the logo feeds one copper "spine" that runs down the page. As you scroll, current flows along it and each section powers on when the current reaches its branch: the LED display starts flashing messages, the test points measure your impact numbers one by one on seven-segment displays, and the experience LEDs light in sequence. Clicking a skill lights up the work that used it, and clicking a project lights up its skills.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript** and **Tailwind CSS v4**, exported as a static site and hosted on **AWS Amplify**.

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

- **LED messages:** `ledFrames` takes up to two lines per message. The display sizes itself to the longest line. Visitors can step through them (tap or swipe the screen, the ◀ ▶ buttons, the arrow keys, or one of the message LEDs); a picked message stays up for `MANUAL_HOLD_MS` in `LedModule.tsx` before the sign carries on. On phones the sign re-wraps each message onto shorter lines (`PHONE_CHARS_PER_LINE`) so the LEDs are bigger, the controls share one row with the switch, and the game gets a taller portrait screen (`PHONE_GAME`). Switching between messages and the game fades the screen out, resizes it if needed, and fades it back in.
- **Skills and work:** `skillGroups` holds the skill pads, grouped by area (set `wide: true` for a group that spans the full row). `projects` are the six featured cards; `builds` are the one-line entries in the "more builds" dropdown. Each lists the skill IDs it used: those decide which pads light up on hover, and which work lights up when a skill or a whole group (its count) is clicked. The groups fold open and closed and start closed; clicking a project opens the groups its skills are in.
- **What I'm working on now:** `nowItems` holds the four channels. A `counter` with `kind: "since"` counts months from a date (time in role); `kind: "until"` counts down to one (the certificate). They're worked out in the visitor's browser, so they stay current without redeploying.
- **Probe readouts:** each metric has a `probe` block (what was measured, role, dates, and the `projectId` its "Trace it to the project" link jumps to).
- **Case studies:** add an `href` to a project and a "Read case study →" link appears on its card.
- **Résumé:** the Résumé buttons open a preview window (`components/ResumeViewer.tsx`) with "Open in new tab" and "Download PDF". The site's copy has no phone number. When you update your résumé, replace two files in `public/`:
  - `resume.pdf`: the PDF people download (downloads as `Osama-Atta-Resume.pdf`).
  - `resume-preview.webp`: a picture of the page for the preview. Render it from the same PDF at about 200 dpi, e.g. `pdftoppm -r 200 -png public/resume.pdf page` and convert to WebP. If the size changes, update `resumePreviewSize` in `src/data/content.ts`, along with `resumeUpdated`.

Colors and fonts are design tokens in **`src/app/globals.css`** (`--color-copper`, `--color-led`, …). Tailwind turns them into classes like `bg-panel` and `text-copper`.

## Deploy

The live site is on **AWS Amplify Hosting**, connected to this GitHub repo: every push to `main` builds the site (`npm run build`) and publishes the static export in `out/`.

**Alternative: GitHub Pages.** `.github/workflows/deploy.yml` lints, builds and publishes to GitHub Pages on every push to `main`. To use it, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**. The site would be at `https://osama-atta.github.io/portfolio/` (or at the root, if the repo is renamed to `osama-atta.github.io` or given a custom domain).

## How it's put together

```
src/
  app/
    layout.tsx         Fonts, metadata, <html>/<body>
    page.tsx           The page: stacks the sections in order
    globals.css        Tailwind import + design tokens
    icon.svg           Favicon: the OA chip with its LED lit (icon.ico for older browsers, apple-icon.png for iPhone home screens)
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
    SkillsAndWork.tsx  Grouped skill pads, featured cards and a "more builds" dropdown. Picking a skill doesn't scroll: the probe under the board lists the work that uses it, and its project links scroll to the card (stopping before Experience powers on). Picking a project card lights its skills without moving the page. While something is picked, a chip shows it (in the corner on desktop, along the bottom on phones): for a skill, ◀ ▶ (or ← →) step through every match and clicking its name lists them all; for a project, it jumps between the card and its lit skills. Escape clears it from anywhere
    Experience.tsx     Roles whose LEDs light in sequence when powered
    StickyHeader.tsx   Slim see-through bar with name, role and city that slides in once the header scrolls away
    HeaderMenu.tsx     The header's menu button below 1024px (MenuButton.tsx has the icon and close-on-Escape/outside-click logic)
    ResumeViewer.tsx   Preview window for the résumé, with Open in new tab and Download PDF
    FaviconLed.tsx     Turns the favicon's LED off while the tab is in the background
    nav.ts             The page's main links, shared by the header, its menu and the pinned bar
    Header, Hero, Contact, SectionHeading, PinIcon, LocalTime
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
