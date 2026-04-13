import { useEffect, useRef, useCallback } from "react";

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
  gap: number;
}

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const STAR_COUNT = 90;
const NEBULA_COUNT = 5;

interface Star { x: number; y: number; r: number; alpha: number; twinkleSpeed: number; twinkleOffset: number; color: string; }
interface Nebula { x: number; y: number; rx: number; ry: number; color: string; alpha: number; }

const STAR_COLORS = ["#ffffff", "#e8d5ff", "#d4b0ff", "#ffccff", "#c8b8ff", "#ffe0ff"];

function makeStars(W: number, H: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.85,
    r: Math.random() * 2.2 + 0.4,
    alpha: Math.random() * 0.5 + 0.5,
    twinkleSpeed: Math.random() * 0.05 + 0.008,
    twinkleOffset: Math.random() * Math.PI * 2,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  }));
}

function makeNebulas(W: number, H: number): Nebula[] {
  const colors = [
    "rgba(160,0,255,",
    "rgba(220,0,180,",
    "rgba(80,0,200,",
    "rgba(255,60,200,",
    "rgba(100,20,220,",
  ];
  return Array.from({ length: NEBULA_COUNT }, (_, i) => ({
    x: (W / NEBULA_COUNT) * i + Math.random() * (W / NEBULA_COUNT),
    y: H * 0.05 + Math.random() * H * 0.5,
    rx: 60 + Math.random() * 90,
    ry: 30 + Math.random() * 55,
    color: colors[i % colors.length],
    alpha: 0.06 + Math.random() * 0.09,
  }));
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  groundY: number,
  frame: number,
  stars: Star[],
  nebulas: Nebula[],
  scrollX: number,
  bgImage: HTMLImageElement | null
) {
  if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    // draw the landscape wallpaper covering the sky area
    ctx.drawImage(bgImage, 0, 0, W, groundY + 4);
    // subtle dark overlay to keep pipes/bird visible
    ctx.fillStyle = "rgba(20,0,40,0.22)";
    ctx.fillRect(0, 0, W, groundY + 4);
  } else {
    // fallback gradient while image loads
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0,    "#2a0040");
    skyGrad.addColorStop(0.4,  "#8b1a8b");
    skyGrad.addColorStop(0.75, "#c040c0");
    skyGrad.addColorStop(1,    "#3a0060");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, groundY);
  }

  // subtle twinkling stars over the image (upper sky area only)
  stars.forEach(s => {
    if (s.y > groundY * 0.35) return; // only top portion of sky
    const tw = Math.sin(frame * s.twinkleSpeed + s.twinkleOffset) * 0.35 + 0.65;
    ctx.save();
    ctx.globalAlpha = s.alpha * tw * 0.7;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawGround(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number, scrollX: number) {
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
  groundGrad.addColorStop(0, "#2a004a");
  groundGrad.addColorStop(0.3, "#1a0035");
  groundGrad.addColorStop(1, "#0d0020");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, W, H - groundY);

  ctx.fillStyle = "#7b20c0";
  ctx.fillRect(0, groundY, W, 5);
  ctx.fillStyle = "#9940e0";
  ctx.fillRect(0, groundY + 1, W, 2);

  const tileW = 30;
  const offsetX = scrollX % tileW;
  for (let x = -tileW + (offsetX > 0 ? offsetX - tileW : offsetX); x < W + tileW; x += tileW) {
    ctx.strokeStyle = "rgba(140,40,220,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, groundY + 5, tileW, 14);
    ctx.strokeRect(x + tileW * 0.5, groundY + 19, tileW, 14);
  }

  const rockOffsetX = scrollX * 0.8;
  for (let i = 0; i < 12; i++) {
    const rx = ((i * 43 + 15 - rockOffsetX % W) % W + W) % W;
    const rh = 4 + (i % 3) * 3;
    const rw = 8 + (i % 4) * 4;
    ctx.fillStyle = `rgba(${100 + (i % 3) * 30},${20 + (i % 2) * 15},${180 + (i % 3) * 20},0.7)`;
    ctx.beginPath();
    ctx.ellipse(rx, groundY + 3, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPipe(
  ctx: CanvasRenderingContext2D,
  x: number,
  topHeight: number,
  gap: number,
  pipeW: number,
  canvasH: number,
  groundY: number
) {
  const capW = pipeW + 14;
  const capH = 20;
  const capX = x - 7;

  function drawPipeSegment(sx: number, sy: number, sw: number, sh: number, capSy: number) {
    if (sh <= 0) return;
    ctx.save();
    // glow behind pipe body
    ctx.shadowColor = "rgba(180, 80, 255, 0.55)";
    ctx.shadowBlur = 18;

    // black body with subtle purple sheen
    const grad = ctx.createLinearGradient(sx, 0, sx + sw, 0);
    grad.addColorStop(0,    "#0a0010");
    grad.addColorStop(0.18, "#1a0030");
    grad.addColorStop(0.42, "#220040");
    grad.addColorStop(0.65, "#1a0030");
    grad.addColorStop(1,    "#0a0010");
    ctx.fillStyle = grad;
    ctx.fillRect(sx, sy, sw, sh);

    // thin highlight stripe
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(200,120,255,0.10)";
    ctx.fillRect(sx + 5, sy, 4, sh);

    // purple border
    ctx.strokeStyle = "rgba(160,60,255,0.55)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx, sy, sw, sh);

    // cap — slightly lighter black + stronger glow
    ctx.shadowColor = "rgba(200,100,255,0.7)";
    ctx.shadowBlur = 22;
    const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
    capGrad.addColorStop(0,    "#0d0018");
    capGrad.addColorStop(0.2,  "#200038");
    capGrad.addColorStop(0.45, "#2a0050");
    capGrad.addColorStop(0.72, "#200038");
    capGrad.addColorStop(1,    "#0d0018");
    ctx.fillStyle = capGrad;
    ctx.fillRect(capX, capSy, capW, capH);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(180,80,255,0.6)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(capX, capSy, capW, capH);
    ctx.fillStyle = "rgba(220,140,255,0.10)";
    ctx.fillRect(capX + 5, capSy + 3, 7, capH - 6);
    ctx.restore();
  }

  drawPipeSegment(x, 0, pipeW, topHeight - capH, topHeight - capH);
  drawPipeSegment(x, topHeight + gap + capH, pipeW, groundY - (topHeight + gap + capH), topHeight + gap);
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  size: number,
  rotation: number,
  wingPhase: number,
  birdCanvas: HTMLCanvasElement | null
) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(rotation);

  // flap squish: compress Y on upstroke, stretch on downstroke
  const flap = Math.sin(wingPhase);
  const scaleX = 1 + flap * 0.12;   // widens on downstroke
  const scaleY = 1 - flap * 0.12;   // squishes vertically on downstroke
  ctx.scale(scaleX, scaleY);

  const s = size * 1.4;

  if (birdCanvas) {
    ctx.shadowColor = "rgba(80, 255, 80, 0.7)";
    ctx.shadowBlur = 22;
    ctx.drawImage(birdCanvas, -s / 2, -s / 2, s, s);
    ctx.shadowBlur = 0;
  } else {
    ctx.shadowColor = "rgba(80,255,80,0.5)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#6ecf3a";
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D, W: number, score: number) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 8;
  const bw = 88, bh = 42;
  const bx = W / 2 - bw / 2;
  ctx.beginPath();
  ctx.roundRect(bx, 14, bw, bh, 12);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(score), W / 2, 14 + bh / 2);
  ctx.restore();
}

export function GameCanvas({ onGameOver, onScoreUpdate }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flapRef = useRef<HTMLAudioElement | null>(null);
  const hitRef = useRef<HTMLAudioElement | null>(null);
  const scoreRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);
  const scrollXRef = useRef(0);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const birdImageRef = useRef<HTMLCanvasElement | null>(null);

  const W = 480;
  const H = 640;
  const GROUND_Y = H - 60;
  const PIPE_WIDTH = 52;
  const BIRD_X = W / 2;
  const BIRD_SIZE = 36;
  const HITBOX_SHRINK = 8;
  const GRAVITY = 0.32;
  const JUMP = -6.2;
  const MIN_GAP = 165;
  const MAX_GAP = 220;
  const MIN_PIPE_H = 60;

  const gameRef = useRef({
    birdY: H / 2,
    birdVY: 0,
    birdRot: 0,
    wingPhase: 0,
    pipes: [] as Pipe[],
    score: 0,
    frame: 0,
    speed: 2.0,
    pipeTimer: 0,
    pipeInterval: 105,
    running: true,
    dead: false,
    groundHit: false,
    hitPlayed: false,
  });

  const playSound = (a: HTMLAudioElement | null) => {
    if (!a) return;
    try { a.currentTime = 0; a.play(); } catch (_) {}
  };

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (g.dead) return;
    g.birdVY = JUMP;
    g.wingPhase = -Math.PI / 2;
    playSound(flapRef.current);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = import.meta.env.BASE_URL + "game-scene-bg.jpg";
    bgImageRef.current = img;

    const birdImg = new Image();
    birdImg.crossOrigin = "anonymous";
    birdImg.src = import.meta.env.BASE_URL + "bird.png";
    birdImg.onload = () => {
      const oc = document.createElement("canvas");
      oc.width  = birdImg.naturalWidth;
      oc.height = birdImg.naturalHeight;
      const oc2 = oc.getContext("2d")!;
      oc2.drawImage(birdImg, 0, 0);
      const data = oc2.getImageData(0, 0, oc.width, oc.height);
      const d = data.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // erase near-white and very light pixels
        const brightness = (r + g + b) / 3;
        if (brightness > 200 && r > 180 && g > 180 && b > 180) {
          // smooth edge: partial transparency for mid-bright pixels
          const t = Math.min(1, (brightness - 200) / 35);
          d[i + 3] = Math.round(d[i + 3] * (1 - t));
        }
      }
      oc2.putImageData(data, 0, 0);
      birdImageRef.current = oc;
    };

    starsRef.current = makeStars(W, H);
    nebulasRef.current = makeNebulas(W, H);

    flapRef.current = new Audio("https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg");
    hitRef.current = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
    scoreRef.current = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");

    const music = new Audio(import.meta.env.BASE_URL + "game-music.mp3");
    music.loop = true;
    music.volume = 0.3;
    musicRef.current = music;
    try { music.play().catch(() => {}); } catch (_) {}

    return () => {
      if (musicRef.current) { musicRef.current.pause(); musicRef.current.src = ""; }
    };
  }, []);

  useEffect(() => {
    const g = gameRef.current;
    g.birdY = H / 2; g.birdVY = 0; g.birdRot = 0; g.wingPhase = 0;
    g.pipes = []; g.score = 0; g.frame = 0; g.speed = 2.0;
    g.pipeTimer = 0; g.pipeInterval = 105;
    g.running = true; g.dead = false; g.groundHit = false; g.hitPlayed = false;
    scrollXRef.current = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", handleKey);

    let lastTime = 0;

    const loop = (timestamp: number) => {
      const g = gameRef.current;
      if (!g.running) return;

      const dt = Math.min((timestamp - lastTime) / 16.67, 2.5);
      lastTime = timestamp;
      g.frame++;

      scrollXRef.current += g.speed * dt;

      drawBackground(ctx, W, H, GROUND_Y, g.frame, starsRef.current, nebulasRef.current, scrollXRef.current, bgImageRef.current);
      drawGround(ctx, W, H, GROUND_Y, scrollXRef.current);

      if (!g.dead) {
        g.wingPhase += 0.28 * dt;
        g.birdVY = Math.min(g.birdVY + GRAVITY * dt, 11);
        g.birdY += g.birdVY * dt;

        const targetRot = Math.max(-0.42, Math.min(1.2, g.birdVY * 0.08));
        g.birdRot += (targetRot - g.birdRot) * 0.2 * dt;

        const speedFactor = 1 + g.score * 0.006;
        g.speed = Math.min(2.0 * speedFactor, 6.0);
        g.pipeInterval = Math.max(72, 105 - g.score * 0.45);

        g.pipeTimer++;
        if (g.pipeTimer >= g.pipeInterval) {
          g.pipeTimer = 0;
          const maxTop = GROUND_Y - MIN_GAP - MIN_PIPE_H;
          const topH = Math.random() * (maxTop - MIN_PIPE_H) + MIN_PIPE_H;
          const gap = Math.max(MIN_GAP, MAX_GAP - g.score * 1.0);
          g.pipes.push({ x: W + 10, topHeight: topH, passed: false, gap });
        }

        g.pipes = g.pipes.filter(p => p.x > -PIPE_WIDTH - 20);
        for (const p of g.pipes) {
          p.x -= g.speed * dt;
          if (!p.passed && p.x + PIPE_WIDTH < BIRD_X - BIRD_SIZE / 2) {
            p.passed = true;
            g.score++;
            onScoreUpdate(g.score);
            playSound(scoreRef.current);
          }
        }

        const br = BIRD_SIZE / 2 - HITBOX_SHRINK;
        for (const p of g.pipes) {
          if (BIRD_X + br > p.x + 4 && BIRD_X - br < p.x + PIPE_WIDTH - 4) {
            if (g.birdY - br < p.topHeight - 2 || g.birdY + br > p.topHeight + p.gap + 2) {
              g.dead = true;
              break;
            }
          }
        }

        if (g.birdY + BIRD_SIZE / 2 >= GROUND_Y) {
          g.birdY = GROUND_Y - BIRD_SIZE / 2;
          g.dead = true;
          g.groundHit = true;
        }
        if (g.birdY - BIRD_SIZE / 2 < 0) {
          g.birdY = BIRD_SIZE / 2;
          g.birdVY = 0;
        }
      } else {
        if (!g.hitPlayed) {
          g.hitPlayed = true;
          playSound(hitRef.current);
        }
        if (!g.groundHit) {
          g.birdVY = Math.min(g.birdVY + GRAVITY * 2 * dt, 14);
          g.birdY = Math.min(g.birdY + g.birdVY * dt, GROUND_Y - BIRD_SIZE / 2);
          g.birdRot = Math.min(g.birdRot + 0.08 * dt, Math.PI / 2);
        }
        if (g.frame > 85) {
          g.running = false;
          if (musicRef.current) musicRef.current.pause();
          onGameOver(g.score);
          return;
        }
      }

      g.pipes.forEach(p => drawPipe(ctx, p.x, p.topHeight, p.gap, PIPE_WIDTH, H, GROUND_Y));
      drawBird(ctx, BIRD_X, g.birdY, BIRD_SIZE, g.birdRot, g.wingPhase, birdImageRef.current);

      if (g.dead) {
        ctx.fillStyle = "rgba(255,60,60,0.1)";
        ctx.fillRect(0, 0, W, H);
      }

      drawHUD(ctx, W, g.score);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", handleKey);
      cancelAnimationFrame(animRef.current);
      gameRef.current.running = false;
    };
  }, [jump, onGameOver, onScoreUpdate]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="game-canvas"
      onClick={jump}
      onTouchStart={(e) => { e.preventDefault(); jump(); }}
      style={{
        cursor: "pointer",
        maxWidth: "100%",
        maxHeight: "100vh",
        display: "block",
        margin: "0 auto",
        borderRadius: "16px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
        border: "2px solid rgba(255,255,255,0.12)",
      }}
    />
  );
}
