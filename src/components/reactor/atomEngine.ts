// A small 3D atom drawn on a 2D canvas: one shaded spherical core, tilted electron orbits that pass in
// front of and behind it, and electrons with short trails. No library: points are rotated in 3D, projected
// with perspective, depth-sorted and painted. The reactor drives it with a power level from 1 to 10:
// more power means more electrons and orbits, faster motion, a bigger core and a hotter core colour.

export type AtomOptions = { reduced: boolean };

type Vec = [number, number, number];
type Drawable = { z: number; draw: () => void };

const ORBITS = [
  { r: 0.62, tx: 1.15, tz: 0.2, w: 1.0 },
  { r: 0.7, tx: 1.05, tz: 2.3, w: 0.86 },
  { r: 0.78, tx: 0.35, tz: 1.2, w: 0.74 },
  { r: 0.84, tx: 1.45, tz: 3.4, w: 0.66 },
  { r: 0.9, tx: 0.8, tz: 4.5, w: 0.58 },
  { r: 0.95, tx: 1.3, tz: 5.6, w: 0.52 },
] as const;

/** Core colour by power: Signal light, Signal, plum, then amber at full power. */
const STOPS: [number, [number, number, number]][] = [
  [1, [143, 136, 255]],
  [4, [75, 64, 255]],
  [7, [176, 75, 216]],
  [9, [235, 125, 0]],
  [10, [255, 165, 60]],
];

function coreColour(level: number): [number, number, number] {
  for (let i = 1; i < STOPS.length; i++) {
    const [a, ca] = STOPS[i - 1];
    const [b, cb] = STOPS[i];
    if (level <= b) {
      const t = Math.max(0, Math.min(1, (level - a) / (b - a)));
      return [ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t];
    }
  }
  return STOPS[STOPS.length - 1][1];
}

const rgba = (c: [number, number, number], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;
const mix = (c: [number, number, number], d: [number, number, number], t: number): [number, number, number] => [
  c[0] + (d[0] - c[0]) * t,
  c[1] + (d[1] - c[1]) * t,
  c[2] + (d[2] - c[2]) * t,
];
const WHITE: [number, number, number] = [255, 255, 255];
const INK: [number, number, number] = [11, 12, 14];

const electronsFor = (level: number) => 2 + Math.round(level) * 2; // 4 .. 22
const orbitsFor = (level: number) => Math.min(ORBITS.length, 2 + Math.floor(level / 2)); // 2 .. 6
const speedFor = (level: number) => 0.55 + level * 0.16; // radians a second at the inner orbit

export function createAtom(canvas: HTMLCanvasElement, opts: AtomOptions) {
  const maybe = canvas.getContext("2d");
  if (!maybe) return { setLevel() {}, pulse() {}, destroy() {}, setReduced() {} };
  const ctx: CanvasRenderingContext2D = maybe;

  let reduced = opts.reduced;
  let W = 0, H = 0, dpr = 1;
  let level = 4, shownLevel = 4;
  let speed = speedFor(4);
  let orbitAlpha: number[] = ORBITS.map((_, i) => (i < orbitsFor(4) ? 1 : 0));
  let electronsShown = electronsFor(4);
  let colour = coreColour(4);
  let yaw = 0.5, pitch = -0.32, vyaw = 0.12, vpitch = 0;
  let dragging = false, lastX = 0, lastY = 0, lastMove = 0;
  let pulseT = 0, boost = 0;
  let t = 0, last = 0, raf = 0, visible = true;
  const phases = Array.from({ length: 22 }, (_, i) => (i * 2.399) % (Math.PI * 2));

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced) frame(performance.now(), true);
  };

  const rotate = (p: Vec, tx: number, tz: number): Vec => {
    // orbit tilt: around X, then around Z
    let [x, y, z] = p;
    let c = Math.cos(tx), s = Math.sin(tx);
    [y, z] = [y * c - z * s, y * s + z * c];
    c = Math.cos(tz); s = Math.sin(tz);
    [x, y] = [x * c - y * s, x * s + y * c];
    return [x, y, z];
  };
  const view = (p: Vec): Vec => {
    // camera: yaw around Y, then pitch around X
    let [x, y, z] = p;
    let c = Math.cos(yaw), s = Math.sin(yaw);
    [x, z] = [x * c + z * s, -x * s + z * c];
    c = Math.cos(pitch); s = Math.sin(pitch);
    [y, z] = [y * c - z * s, y * s + z * c];
    return [x, y, z];
  };

  function frame(now: number, once = false) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    const R = Math.min(W, H) * 0.46;
    const cx = W / 2, cy = H / 2, f = R * 3.4;
    const project = (p: Vec) => {
      const s = f / (f - p[2] * R);
      return { x: cx + p[0] * R * s, y: cy + p[1] * R * s, s, z: p[2] };
    };

    // ease every visual toward the current power level
    const k = reduced ? 1 : 1 - Math.pow(0.0025, dt);
    shownLevel += (level - shownLevel) * k;
    speed += (speedFor(level) * (1 + boost) - speed) * k;
    electronsShown += (electronsFor(level) - electronsShown) * k;
    colour = coreColour(shownLevel);
    const nOrbits = orbitsFor(level);
    orbitAlpha = orbitAlpha.map((a, i) => a + ((i < nOrbits ? 1 : 0) - a) * k);
    boost *= Math.pow(0.2, dt);
    pulseT = Math.max(0, pulseT - dt * 1.6);

    if (!reduced) {
      t += dt * speed;
      if (!dragging) {
        yaw += vyaw * dt;
        pitch += vpitch * dt;
        vyaw += (0.12 - vyaw) * (1 - Math.pow(0.4, dt));
        vpitch *= Math.pow(0.15, dt);
        pitch += (-0.32 - pitch) * (1 - Math.pow(0.6, dt));
      }
    }

    ctx.clearRect(0, 0, W, H);

    // core glow
    const hot = (shownLevel - 1) / 9;
    const glowR = R * (0.62 + 0.18 * hot + 0.25 * pulseT + (reduced ? 0 : 0.03 * Math.sin(now / 700)));
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    g.addColorStop(0, rgba(mix(colour, WHITE, 0.55), 0.95));
    g.addColorStop(0.35, rgba(colour, 0.55 + 0.2 * hot));
    g.addColorStop(1, rgba(colour, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fill();

    const items: Drawable[] = [];
    const ringColour = mix([222, 218, 255], colour, 0.35 * hot);

    // orbit rings, as depth-sorted segments so they pass behind and in front of the core
    ORBITS.forEach((o, i) => {
      const a = orbitAlpha[i];
      if (a < 0.02) return;
      const N = 72;
      let prev = project(view(rotate([o.r, 0, 0], o.tx, o.tz)));
      for (let j = 1; j <= N; j++) {
        const th = (j / N) * Math.PI * 2;
        const cur = project(view(rotate([o.r * Math.cos(th), o.r * Math.sin(th), 0], o.tx, o.tz)));
        const p0 = prev, z = (p0.z + cur.z) / 2;
        items.push({
          z,
          draw: () => {
            ctx.strokeStyle = rgba(ringColour, a * (0.28 + 0.5 * ((z + 1) / 2)));
            ctx.lineWidth = 1.4 * ((p0.s + cur.s) / 2);
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(cur.x, cur.y);
            ctx.stroke();
          },
        });
        prev = cur;
      }
    });

    // electrons with trails
    const count = Math.ceil(electronsShown);
    for (let e = 0; e < count; e++) {
      const o = ORBITS[e % nOrbits] ?? ORBITS[0];
      const oi = e % nOrbits;
      const alpha = Math.max(0, Math.min(1, electronsShown - e)) * orbitAlpha[oi];
      if (alpha < 0.02) continue;
      const dir = oi % 2 ? -1 : 1;
      const base = phases[e] + dir * t * o.w;
      const head = project(view(rotate([o.r * Math.cos(base), o.r * Math.sin(base), 0], o.tx, o.tz)));
      const trail: { x: number; y: number; s: number }[] = [];
      if (!reduced) {
        for (let k2 = 1; k2 <= 10; k2++) {
          const th = base - dir * k2 * 0.035 * Math.min(2.2, speed / 1.2);
          trail.push(project(view(rotate([o.r * Math.cos(th), o.r * Math.sin(th), 0], o.tx, o.tz))));
        }
      }
      items.push({
        z: head.z + 0.001,
        draw: () => {
          const r = 5.2 * head.s;
          // a tapered streak behind the electron
          ctx.lineCap = "round";
          let from: { x: number; y: number } = head;
          trail.forEach((p, idx) => {
            const fade = 1 - idx / trail.length;
            ctx.strokeStyle = rgba(mix(colour, WHITE, 0.5), alpha * 0.5 * fade);
            ctx.lineWidth = r * 1.5 * fade;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            from = p;
          });
          const halo = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, r * 3.2);
          halo.addColorStop(0, rgba(mix(colour, WHITE, 0.7), alpha * 0.55));
          halo.addColorStop(1, rgba(colour, 0));
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(head.x, head.y, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
          const body = ctx.createRadialGradient(head.x - r * 0.35, head.y - r * 0.35, 0, head.x, head.y, r);
          body.addColorStop(0, rgba(WHITE, alpha));
          body.addColorStop(1, rgba(mix(colour, WHITE, 0.45), alpha));
          ctx.fillStyle = body;
          ctx.beginPath();
          ctx.arc(head.x, head.y, r, 0, Math.PI * 2);
          ctx.fill();
        },
      });
    }

    // the core: one shaded sphere that grows and heats up with power
    const coreR = R * (0.17 + 0.07 * hot + 0.035 * pulseT + (reduced ? 0 : 0.006 * Math.sin(now / 520)));
    items.push({
      z: 0,
      draw: () => {
        const body = ctx.createRadialGradient(cx - coreR * 0.38, cy - coreR * 0.42, coreR * 0.05, cx, cy, coreR);
        body.addColorStop(0, rgba(mix(colour, WHITE, 0.85), 1));
        body.addColorStop(0.35, rgba(mix(colour, WHITE, 0.25), 1));
        body.addColorStop(0.8, rgba(colour, 1));
        body.addColorStop(1, rgba(mix(colour, INK, 0.45), 1));
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
        // rim light on the far side, so the ball reads as round against the glow
        const rim = ctx.createRadialGradient(cx - coreR * 0.25, cy - coreR * 0.25, coreR * 0.7, cx, cy, coreR * 1.02);
        rim.addColorStop(0, rgba(WHITE, 0));
        rim.addColorStop(1, rgba(mix(colour, WHITE, 0.6), 0.55));
        ctx.fillStyle = rim;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
        // specular highlight
        const spec = ctx.createRadialGradient(cx - coreR * 0.4, cy - coreR * 0.45, 0, cx - coreR * 0.4, cy - coreR * 0.45, coreR * 0.38);
        spec.addColorStop(0, rgba(WHITE, 0.9));
        spec.addColorStop(1, rgba(WHITE, 0));
        ctx.fillStyle = spec;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
      },
    });

    items.sort((a, b) => a.z - b.z).forEach((d) => d.draw());

    if (!once && !reduced && visible) raf = requestAnimationFrame((n) => frame(n));
  }

  const start = () => {
    cancelAnimationFrame(raf);
    last = 0;
    if (reduced) frame(performance.now(), true);
    else raf = requestAnimationFrame((n) => frame(n));
  };

  // drag to spin, with momentum; on touch only sideways drags spin so the page still scrolls
  const down = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMove = performance.now();
    vyaw = 0;
    vpitch = 0;
    canvas.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    const now = performance.now();
    const dtm = Math.max(1, now - lastMove) / 1000;
    const dx = e.clientX - lastX, dy = e.pointerType === "touch" ? 0 : e.clientY - lastY;
    yaw += dx * 0.01;
    pitch = Math.max(-1.2, Math.min(1.2, pitch + dy * 0.01));
    vyaw = (dx * 0.01) / dtm;
    vpitch = (dy * 0.01) / dtm;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMove = now;
    if (reduced) frame(now, true);
  };
  const up = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) start();
    else cancelAnimationFrame(raf);
  });
  io.observe(canvas);
  const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : visible && start());
  document.addEventListener("visibilitychange", onVis);
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  resize();
  start();

  return {
    setLevel(n: number) {
      level = Math.max(1, Math.min(10, n));
      if (reduced) frame(performance.now(), true);
    },
    /** A short flare: brighter core and a burst of speed. */
    pulse() {
      pulseT = 1;
      boost = 1.2;
      if (reduced) frame(performance.now(), true);
    },
    setReduced(r: boolean) {
      reduced = r;
      start();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    },
  };
}

export type Atom = ReturnType<typeof createAtom>;
