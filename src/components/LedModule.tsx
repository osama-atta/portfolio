"use client";

import { useMemo, useRef, useState } from "react";
import { ledFrames } from "@/data/content";
import { layoutFrames } from "@/lib/ledFont";
import { LedDisplay } from "./LedDisplay";
import { BrickBreaker, type Hud } from "./BrickBreaker";

function MountingHole({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute size-2.5 rounded-full border-[3px] border-copper ${className}`} />;
}

// After a visitor picks a message, it stays up this long before the sign carries on by itself.
const MANUAL_HOLD_MS = 3000;
const SWIPE_PX = 40;

const HINTS: Record<Hud["status"], string> = {
  ready: "CLICK OR SPACE TO LAUNCH",
  playing: "MOUSE OR ← → TO MOVE",
  won: "CLICK TO PLAY AGAIN",
  lost: "CLICK TO PLAY AGAIN",
};

/** A slide switch, like the ones on a dev board, that flips the display between messages and the game. */
function ModeSwitch({ on, onToggle, buttonRef }: { on: boolean; onToggle: () => void; buttonRef: React.Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Brick breaker mode"
      onClick={onToggle}
      className="group inline-flex min-h-9 cursor-pointer items-center gap-2 rounded border-0 bg-transparent px-1 font-mono text-xs"
    >
      <span className={on ? "text-[#8fa89b]" : "text-ink"}>MSG</span>
      <span
        aria-hidden="true"
        className={`relative h-[18px] w-9 rounded-full border-2 transition-colors duration-200 ${
          on ? "border-copper bg-copper/25" : "border-line-strong bg-[#050605]"
        } group-hover:border-copper`}
      >
        <span
          className={`absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full transition-all duration-200 ${
            on ? "left-[19px] bg-led shadow-[0_0_8px_var(--color-led)]" : "left-[3px] bg-[#8fa89b]"
          }`}
        />
      </span>
      <span className={on ? "text-ink" : "text-[#8fa89b]"}>GAME</span>
    </button>
  );
}

/**
 * A 6 mm tactile switch as it looks soldered to a board: a metal body with a
 * round actuator in the middle and two legs on each side. The legs on the
 * inner side sit on the copper trace that runs to the message LEDs.
 * The arrow is printed on the board under it, next to its designator.
 */
function TactileSwitch({ label, designator, arrow, onPress }: { label: string; designator: string; arrow: "◀" | "▶"; onPress: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className="group/sw relative z-10 grid h-9 w-11 flex-none cursor-pointer place-items-center border-0 bg-transparent p-0"
    >
      {/* Legs / solder pads: two on each side. */}
      {["left-0.5 top-[9px]", "left-0.5 bottom-[9px]", "right-0.5 top-[9px]", "right-0.5 bottom-[9px]"].map((pos) => (
        <span key={pos} aria-hidden="true" className={`absolute h-[5px] w-[9px] rounded-[1px] bg-[#b9c0c3] ${pos}`} />
      ))}
      {/* Metal body */}
      <span
        aria-hidden="true"
        className="relative grid size-[26px] place-items-center rounded-[3px] border border-[#5b6265] bg-[linear-gradient(145deg,#dfe4e6_0%,#a7aeb1_55%,#868d90_100%)] shadow-[0_2px_3px_rgb(0_0_0/0.6)] transition-shadow group-hover/sw:shadow-[0_2px_3px_rgb(0_0_0/0.6),0_0_10px_-1px_var(--color-copper)]"
      >
        {/* Round actuator: presses down when clicked. */}
        <span className="size-[15px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#5a6064,#16191a_70%)] shadow-[0_1px_1px_rgb(255_255_255/0.35),0_2px_2px_rgb(0_0_0/0.7)] transition-transform group-active/sw:translate-y-px group-active/sw:scale-95" />
      </span>
      {/* Silkscreen: designator and direction, printed below the switch. */}
      <span aria-hidden="true" className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tracking-[0.08em] text-[#c3d4ca]/70">
        {arrow === "◀" ? `◀ ${designator}` : `${designator} ▶`}
      </span>
    </button>
  );
}

/**
 * The LED display module. Normally it flashes messages; flip the switch to
 * turn the same dot matrix into a game of brick breaker.
 * Visitors can also step through the messages: tap or swipe the screen, use
 * the tactile switches (SW1/SW2) or the arrow keys, or click one of the message LEDs.
 */
export function LedModule() {
  const { cols, rows } = useMemo(() => layoutFrames(ledFrames), []);
  const [playing, setPlaying] = useState(false);
  const [hud, setHud] = useState<Hud>({ score: 0, lives: 3, status: "ready" });
  const switchRef = useRef<HTMLButtonElement>(null);
  const [frame, setFrame] = useState(0);
  const [manual, setManual] = useState(false); // the visitor picked this message, so hold it longer
  const swipeStart = useRef<number | null>(null);

  const count = ledFrames.length;
  const show = (i: number) => {
    setFrame(((i % count) + count) % count);
    setManual(true);
  };
  const next = () => show(frame + 1);
  const prev = () => show(frame - 1);

  // Back to messages: always start again from the first one ("HI, I'M OSAMA ATTA").
  const backToMessages = () => {
    setPlaying(false);
    setFrame(0);
    setManual(false);
  };
  const toggle = () => {
    if (playing) return backToMessages();
    setHud({ score: 0, lives: 3, status: "ready" });
    setPlaying(true);
  };
  const exit = () => {
    backToMessages();
    requestAnimationFrame(() => switchRef.current?.focus({ preventScroll: true }));
  };

  return (
    <div className="relative rounded-[10px] border-2 border-line-strong bg-module px-4 pb-4 pt-6 sm:px-[30px] sm:pb-[18px] sm:pt-[26px]">
      <MountingHole className="left-[9px] top-[9px]" />
      <MountingHole className="right-[9px] top-[9px]" />
      <MountingHole className="bottom-[9px] left-[9px]" />
      <MountingHole className="bottom-[9px] right-[9px]" />

      <div
        className={`rounded-md bg-[#050605] p-3 shadow-[inset_0_0_0_1px_#000] sm:p-4 ${playing ? "" : "cursor-pointer touch-pan-y select-none"}`}
        title={playing ? undefined : "Tap for the next message"}
        // Tap the screen for the next message; swipe left or right to step either way.
        onPointerDown={playing ? undefined : (e) => (swipeStart.current = e.clientX)}
        onPointerUp={
          playing
            ? undefined
            : (e) => {
                if (swipeStart.current === null) return;
                const dx = e.clientX - swipeStart.current;
                swipeStart.current = null;
                if (dx > SWIPE_PX) prev();
                else next();
              }
        }
      >
        {playing ? (
          <BrickBreaker cols={cols} rows={rows} onExit={exit} onHud={setHud} />
        ) : (
          <LedDisplay
            frames={ledFrames}
            index={frame}
            powerIndex={0}
            holdMs={manual ? MANUAL_HOLD_MS : undefined}
            onAuto={(i) => {
              setFrame(i);
              setManual(false);
            }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-2 pt-2 font-mono text-xs text-[#8fa89b] sm:px-0">
        {/*
          Both modes share the same slots, and the one not in use is only made invisible
          (it still takes up its space), so the module never changes size when you switch.
        */}
        <span className="grid [&>*]:[grid-area:1/1]">
          <span className={playing ? "invisible" : ""}>DS1 · LED MATRIX</span>
          <span className={`flex items-center gap-3 ${playing ? "" : "invisible"}`}>
            <span className="text-ink">SCORE {String(hud.score).padStart(3, "0")}</span>
            <span className="flex items-center gap-1.5" aria-label={`${hud.lives} lives left`}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`size-2 rounded-full ${i < hud.lives ? "bg-led shadow-[0_0_6px_var(--color-led)]" : "bg-white/10"}`}
                />
              ))}
            </span>
          </span>
        </span>
        <div className="grid place-items-center [&>*]:[grid-area:1/1]">
          {/* Message controls: ◀ ▶ push buttons around a row of LEDs, one per message. Arrow keys work too. */}
          <div
            role="group"
            aria-label="LED messages"
            className={`group/ctl relative flex items-center pb-3.5 ${playing ? "invisible" : ""}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") next();
              else if (e.key === "ArrowLeft") prev();
              else return;
              e.preventDefault();
            }}
          >
            {/* The copper trace the switches and LEDs are soldered to. It brightens while you use the controls. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-5 top-[17px] h-[2px] rounded-full bg-copper/40 transition-colors duration-200 group-hover/ctl:bg-copper/80 group-focus-within/ctl:bg-copper/80"
            />
            <TactileSwitch label="Previous message" designator="SW1" arrow="◀" onPress={prev} />
            <span className="relative z-10 flex items-center gap-1 px-1.5">
              {ledFrames.map((lines, i) => (
                <button
                  key={lines.join(" ")}
                  type="button"
                  aria-label={`Message ${i + 1} of ${count}: ${lines.join(" ").toLowerCase()}`}
                  aria-current={i === frame}
                  onClick={() => show(i)}
                  className="group/led grid h-9 w-6 cursor-pointer place-items-center border-0 bg-transparent p-0"
                >
                  {/* A surface-mount LED: two tinned pads with the lens between them. */}
                  <span aria-hidden="true" className="flex h-2 items-stretch">
                    <span className="w-[3px] rounded-l-[1px] bg-[#b9c0c3]" />
                    <span
                      className={`w-2.5 transition-[background-color,box-shadow] duration-200 ${
                        i === frame
                          ? "bg-led shadow-[0_0_10px_var(--color-led),0_0_3px_var(--color-led)]"
                          : "bg-[#3a2020] group-hover/led:bg-[#6a2a2a]"
                      }`}
                    />
                    <span className="w-[3px] rounded-r-[1px] bg-[#b9c0c3]" />
                  </span>
                </button>
              ))}
            </span>
            <TactileSwitch label="Next message" designator="SW2" arrow="▶" onPress={next} />
          </div>
          <span className={`hidden md:inline ${playing ? "" : "invisible"}`}>{HINTS[hud.status]} · ESC TO EXIT</span>
        </div>
        <span className="sr-only" aria-live="polite">
          {playing && hud.status === "won" ? `You win! Score ${hud.score}.` : playing && hud.status === "lost" ? `Game over. Score ${hud.score}.` : ""}
        </span>
        <ModeSwitch on={playing} onToggle={toggle} buttonRef={switchRef} />
      </div>
    </div>
  );
}
