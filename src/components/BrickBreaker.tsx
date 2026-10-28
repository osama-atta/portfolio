"use client";

import { useEffect, useRef } from "react";
import { textToGrid } from "@/lib/ledFont";

/*
  Brick breaker, played on the LED display's own dot grid.

  The game state lives in a ref (not React state) because it changes 60
  times a second; a requestAnimationFrame loop updates it and redraws a
  <canvas>. Only the HUD (score, lives, status) goes back to React, and
  only when it changes.

  Coordinates are in LED cells: x = 0…cols-1 left to right, y = 0…rows-1 top
  to bottom. The ball moves in fractional cells and lights the nearest LED.
*/

export type GameStatus = "ready" | "playing" | "won" | "lost";
export type Hud = { score: number; lives: number; status: GameStatus };

type Brick = { x: number; y: number; alive: boolean };

type Game = {
  bricks: Brick[];
  cellToBrick: Int16Array; // rows * cols, -1 where there's no brick
  paddleX: number; // left edge of the paddle
  ballX: number;
  ballY: number;
  vx: number;
  vy: number;
  speed: number;
  score: number;
  lives: number;
  status: GameStatus;
  message: boolean[][] | null; // "YOU WIN" / "GAME OVER" screen
};

const BRICK_W = 5;
const BRICK_ROWS = 4; // default; a taller (phone) screen can ask for more
const PADDLE_W = 11;
const START_SPEED = 24; // cells per second
const MAX_SPEED = 40;
const KEY_SPEED = 55; // paddle speed with arrow keys, cells per second
const LIVES = 3;
const POINTS = 10;
const MAX_BOUNCE = (60 * Math.PI) / 180; // steepest angle off the paddle edge

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function newGame(cols: number, rows: number, brickRows = BRICK_ROWS): Game {
  const perRow = Math.floor((cols + 1) / (BRICK_W + 1));
  const rowWidth = perRow * (BRICK_W + 1) - 1;
  const x0 = Math.floor((cols - rowWidth) / 2);
  const bricks: Brick[] = [];
  const cellToBrick = new Int16Array(rows * cols).fill(-1);
  for (let r = 0; r < brickRows; r++) {
    for (let i = 0; i < perRow; i++) {
      const brick = { x: x0 + i * (BRICK_W + 1), y: 1 + r, alive: true };
      for (let k = 0; k < BRICK_W; k++) cellToBrick[brick.y * cols + brick.x + k] = bricks.length;
      bricks.push(brick);
    }
  }
  const game: Game = {
    bricks,
    cellToBrick,
    paddleX: (cols - PADDLE_W) / 2,
    ballX: 0,
    ballY: 0,
    vx: 0,
    vy: 0,
    speed: START_SPEED,
    score: 0,
    lives: LIVES,
    status: "ready",
    message: null,
  };
  placeBallOnPaddle(game, rows);
  return game;
}

function placeBallOnPaddle(g: Game, rows: number) {
  g.status = "ready";
  g.ballX = g.paddleX + (PADDLE_W - 1) / 2;
  g.ballY = rows - 2;
  g.speed = START_SPEED;
}

function launch(g: Game) {
  const angle = ((Math.random() * 40 - 20) * Math.PI) / 180;
  g.vx = g.speed * Math.sin(angle);
  g.vy = -g.speed * Math.cos(angle);
  g.status = "playing";
}

function step(g: Game, dt: number, cols: number, rows: number, keyDir: number) {
  g.paddleX = clamp(g.paddleX + keyDir * KEY_SPEED * dt, 0, cols - PADDLE_W);

  if (g.status === "ready") {
    g.ballX = g.paddleX + (PADDLE_W - 1) / 2;
    return;
  }
  if (g.status !== "playing") return;

  // Move in small sub-steps so the ball can't tunnel through a brick.
  const steps = Math.max(1, Math.ceil((g.speed * dt) / 0.4));
  const h = dt / steps;
  const paddleRow = rows - 1;

  for (let s = 0; s < steps; s++) {
    const px = g.ballX;
    const py = g.ballY;
    let nx = px + g.vx * h;
    let ny = py + g.vy * h;

    // Walls and ceiling
    if (nx < 0) {
      nx = -nx;
      g.vx = Math.abs(g.vx);
    } else if (nx > cols - 1) {
      nx = 2 * (cols - 1) - nx;
      g.vx = -Math.abs(g.vx);
    }
    if (ny < 0) {
      ny = -ny;
      g.vy = Math.abs(g.vy);
    }

    // Bricks
    const cx = Math.round(nx);
    const cy = Math.round(ny);
    if (cy >= 0 && cy < rows && cx >= 0 && cx < cols) {
      const index = g.cellToBrick[cy * cols + cx];
      if (index >= 0) {
        const brick = g.bricks[index];
        brick.alive = false;
        for (let k = 0; k < BRICK_W; k++) g.cellToBrick[brick.y * cols + brick.x + k] = -1;
        g.score += POINTS;
        // Came in from above/below → bounce vertically; from the side → horizontally.
        if (Math.round(py) !== cy) {
          g.vy = -g.vy;
          ny = py;
        } else {
          g.vx = -g.vx;
          nx = px;
        }
        if (g.bricks.every((b) => !b.alive)) {
          g.status = "won";
          g.message = textToGrid(["YOU WIN!", `SCORE ${g.score}`], cols, rows);
          return;
        }
      }
    }

    // Paddle: the further from center it hits, the steeper the bounce.
    if (g.vy > 0 && ny >= paddleRow - 1 && py < paddleRow - 1 + 1e-6) {
      const left = g.paddleX - 0.6;
      const right = g.paddleX + PADDLE_W - 1 + 0.6;
      if (nx >= left && nx <= right) {
        const center = g.paddleX + (PADDLE_W - 1) / 2;
        const t = clamp((nx - center) / ((PADDLE_W - 1) / 2 + 0.6), -1, 1);
        g.speed = Math.min(MAX_SPEED, g.speed * 1.03);
        g.vx = g.speed * Math.sin(t * MAX_BOUNCE);
        g.vy = -g.speed * Math.cos(t * MAX_BOUNCE);
        ny = paddleRow - 1;
      }
    }

    // Missed the paddle
    if (ny > rows - 0.5) {
      g.lives -= 1;
      if (g.lives <= 0) {
        g.status = "lost";
        g.message = textToGrid(["GAME OVER", `SCORE ${g.score}`], cols, rows);
      } else {
        placeBallOnPaddle(g, rows);
      }
      return;
    }

    g.ballX = nx;
    g.ballY = ny;
  }
}

function draw(ctx: CanvasRenderingContext2D, g: Game, cols: number, rows: number, w: number, h: number, dpr: number, led: string) {
  const cw = w / cols;
  const ch = h / rows;
  const radius = Math.min(cw, ch) * 0.36;
  const lit: boolean[][] = g.message ?? Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));

  if (!g.message) {
    for (const b of g.bricks) {
      if (b.alive) for (let k = 0; k < BRICK_W; k++) lit[b.y][b.x + k] = true;
    }
    const p0 = Math.round(g.paddleX);
    for (let k = 0; k < PADDLE_W; k++) lit[rows - 1][p0 + k] = true;
    const bx = clamp(Math.round(g.ballX), 0, cols - 1);
    const by = clamp(Math.round(g.ballY), 0, rows - 1);
    lit[by][bx] = true;
  }

  ctx.clearRect(0, 0, w, h);
  const off = new Path2D();
  const on = new Path2D();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const path = lit[y][x] ? on : off;
      const cx = (x + 0.5) * cw;
      const cy = (y + 0.5) * ch;
      path.moveTo(cx + radius, cy);
      path.arc(cx, cy, radius, 0, Math.PI * 2);
    }
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fill(off);
  ctx.shadowColor = led;
  ctx.shadowBlur = 6 * dpr;
  ctx.fillStyle = led;
  ctx.fill(on);
}

type Props = {
  cols: number;
  rows: number;
  /** Rows of bricks to start with (more on the taller phone screen). */
  brickRows?: number;
  onExit: () => void;
  onHud: (hud: Hud) => void;
};

export function BrickBreaker({ cols, rows, brickRows = BRICK_ROWS, onExit, onHud }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game>(null);
  const keysRef = useRef({ left: false, right: false });
  // Keep the latest callbacks without restarting the game loop when they change.
  const onHudRef = useRef(onHud);
  const onExitRef = useRef(onExit);
  useEffect(() => {
    onHudRef.current = onHud;
    onExitRef.current = onExit;
  });

  const game = () => (gameRef.current ??= newGame(cols, rows, brickRows));

  const startOrLaunch = () => {
    const g = game();
    if (g.status === "won" || g.status === "lost") gameRef.current = newGame(cols, rows, brickRows);
    else if (g.status === "ready") launch(g);
  };

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const led = getComputedStyle(document.documentElement).getPropertyValue("--color-led").trim() || "#ff4d4d";
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frame = 0;
    let last = performance.now();
    let lastHud = "";
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const g = (gameRef.current ??= newGame(cols, rows, brickRows));
      const keyDir = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);
      step(g, dt, cols, rows, keyDir);
      draw(ctx, g, cols, rows, canvas.width, canvas.height, dpr, led);
      const hud = `${g.score}|${g.lives}|${g.status}`;
      if (hud !== lastHud) {
        lastHud = hud;
        onHudRef.current({ score: g.score, lives: g.lives, status: g.status });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    wrapRef.current?.focus({ preventScroll: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [cols, rows, brickRows]);

  const movePaddleTo = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * cols;
    const g = game();
    g.paddleX = clamp(x - PADDLE_W / 2, 0, cols - PADDLE_W);
  };

  return (
    <div
      ref={wrapRef}
      role="application"
      aria-label="Brick breaker. Move the paddle with the mouse, your finger, or the left and right arrow keys. Press space to launch the ball and escape to exit."
      tabIndex={0}
      className="relative w-full outline-none"
      style={{ aspectRatio: `${cols} / ${rows}` }}
      onKeyDown={(e) => {
        const k = e.key;
        if (k === "ArrowLeft" || k === "a" || k === "A") keysRef.current.left = true;
        else if (k === "ArrowRight" || k === "d" || k === "D") keysRef.current.right = true;
        else if (k === " " || k === "ArrowUp" || k === "Enter") startOrLaunch();
        else if (k === "Escape") onExitRef.current();
        else return;
        e.preventDefault(); // keep arrows and space from scrolling the page
      }}
      onKeyUp={(e) => {
        const k = e.key;
        if (k === "ArrowLeft" || k === "a" || k === "A") keysRef.current.left = false;
        if (k === "ArrowRight" || k === "d" || k === "D") keysRef.current.right = false;
      }}
      onBlur={() => {
        keysRef.current = { left: false, right: false };
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full cursor-none touch-none"
        onPointerMove={(e) => movePaddleTo(e.clientX)}
        onPointerDown={(e) => {
          movePaddleTo(e.clientX);
          startOrLaunch();
        }}
      />
    </div>
  );
}
