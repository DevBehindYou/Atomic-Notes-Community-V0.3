// The Home hero atom, drawn on a canvas that covers the whole hero. A big glass core sits over an anchor
// element in the hero grid, four electrons orbit it on tilted rings, and each electron is drawn like the site
// cursor: a dot inside a thin ring. Electrons can be grabbed and thrown; a spring pulls them back into orbit.
// No library: points are rotated in 3D, projected with perspective, depth-sorted and painted.

type Vec = [number, number, number];
type RGB = [number, number, number];
type Pt = { x: number; y: number; s: number; z: number };

const PAPER: RGB = [244, 245, 241];
const SIGNAL: RGB = [75, 64, 255];
const SIGNAL_LIGHT: RGB = [143, 136, 255];
const MIST: RGB = [216, 214, 255];
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

/** Ring radius (in orbit units), tilt around X, tilt around Z, angular speed in rad/s. */
const ORBITS = [
  { r: 0.84, tx: 1.2, tz: 0.35, w: 0.62, phase: 0.4 },
  { r: 0.92, tx: 1.05, tz: 2.45, w: -0.5, phase: 2.2 },
  { r: 0.98, tx: 0.42, tz: 1.3, w: 0.44, phase: 4.1 },
  { r: 0.88, tx: 1.48, tz: 3.9, w: -0.56, phase: 5.3 },
] as const;

type Electron = {
  mode: "orbit" | "held" | "free";
  angle: number;
  x: number; // screen position while held or free
  y: number;
  vx: number;
  vy: number;
  hover: number; // 0..1, eased
  trail: { x: number; y: number }[];
};

export type HeroAtomOptions = {
  reduced: boolean;
  /** Called with true while the pointer is over (or holding) an electron, so the site cursor can react. */
  onCursor?: (state: "drag" | "hold" | null) => void;
  /** Called each frame with the electrons that are out of orbit, in host pixels, so text can react to them. */
  onFly?: (points: { x: number; y: number; vx: number; vy: number }[]) => void;
};

export function createHeroAtom(canvas: HTMLCanvasElement, host: HTMLElement, anchor: HTMLElement, opts: HeroAtomOptions) {
  const maybe = canvas.getContext("2d");
  if (!maybe) return { destroy() {}, setReduced() {} };
  const ctx: CanvasRenderingContext2D = maybe;

  let reduced = opts.reduced;
  let W = 0, H = 0, dpr = 1;
  let cx = 0, cy = 0, R = 100; // atom centre and orbit scale, in canvas pixels
  let yaw = 0.4, pitch = -0.28, tiltX = 0, tiltY = 0; // tilt follows the pointer a little
  let t = 0, last = 0, raf = 0, visible = true;
  let pointer = { x: -9999, y: -9999, inside: false };
  let held: Electron | null = null;
  let grabDX = 0, grabDY = 0;
  let lastCursor: "drag" | "hold" | null = null;
  const samples: { x: number; y: number; t: number }[] = [];

  const electrons: Electron[] = ORBITS.map((o) => ({
    mode: "orbit",
    angle: o.phase,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    hover: 0,
    trail: [],
  }));

  const measure = () => {
    const h = host.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, h.width);
    H = Math.max(1, h.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = a.left - h.left + a.width / 2;
    cy = a.top - h.top + a.height / 2;
    R = Math.max(60, Math.min(a.width, a.height) * 0.5);
    if (reduced) draw(performance.now(), true);
  };

  const rotate = (p: Vec, tx: number, tz: number): Vec => {
    let [x, y, z] = p;
    let c = Math.cos(tx), s = Math.sin(tx);
    [y, z] = [y * c - z * s, y * s + z * c];
    c = Math.cos(tz); s = Math.sin(tz);
    [x, y] = [x * c - y * s, x * s + y * c];
    return [x, y, z];
  };
  const view = (p: Vec): Vec => {
    let [x, y, z] = p;
    let c = Math.cos(yaw + tiltY), s = Math.sin(yaw + tiltY);
    [x, z] = [x * c + z * s, -x * s + z * c];
    c = Math.cos(pitch + tiltX); s = Math.sin(pitch + tiltX);
    [y, z] = [y * c - z * s, y * s + z * c];
    return [x, y, z];
  };
  const project = (p: Vec): Pt => {
    const f = 3.6;
    const s = f / (f - p[2]);
    return { x: cx + p[0] * R * s, y: cy + p[1] * R * s, s, z: p[2] };
  };
  const orbitPoint = (i: number, angle: number) => {
    const o = ORBITS[i];
    return project(view(rotate([o.r * Math.cos(angle), o.r * Math.sin(angle), 0], o.tx, o.tz)));
  };
  /** Where electron [i] is drawn right now. */
  const electronPos = (i: number): Pt => {
    const e = electrons[i];
    if (e.mode === "orbit") return orbitPoint(i, e.angle);
    return { x: e.x, y: e.y, s: 1.08, z: 2 };
  };

  const coreR = () => R * 0.44;

  function drawCore(now: number) {
    const r = coreR();
    // halo behind the glass
    const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.1);
    halo.addColorStop(0, rgba([58, 47, 240], 0.32));
    halo.addColorStop(1, rgba([58, 47, 240], 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // glass body: nearly clear in the middle, brighter towards the rim (fresnel)
    const body = ctx.createRadialGradient(cx - r * 0.18, cy - r * 0.2, r * 0.1, cx, cy, r);
    body.addColorStop(0, rgba(SIGNAL_LIGHT, 0.06));
    body.addColorStop(0.62, rgba(SIGNAL, 0.14));
    body.addColorStop(0.9, rgba(SIGNAL_LIGHT, 0.3));
    body.addColorStop(1, rgba(MIST, 0.55));
    ctx.fillStyle = body;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // light inside the glass, breathing slowly
    const breathe = reduced ? 0 : Math.sin(now / 1400) * 0.06;
    const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * (0.62 + breathe));
    inner.addColorStop(0, rgba(PAPER, 0.5));
    inner.addColorStop(0.25, rgba(SIGNAL_LIGHT, 0.35));
    inner.addColorStop(1, rgba(SIGNAL, 0));
    ctx.fillStyle = inner;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // meridians and an equator turning with the camera, so the ball reads as a solid in space
    const rings: [number, number][] = [
      [Math.PI / 2, 0],
      [Math.PI / 2, Math.PI / 3],
      [Math.PI / 2, (2 * Math.PI) / 3],
      [0, 0],
    ];
    const k = 0.44; // the core radius in orbit units
    rings.forEach(([tx, tz]) => {
      let prev: Pt | null = null;
      for (let j = 0; j <= 64; j++) {
        const a = (j / 64) * Math.PI * 2;
        const p = project(view(rotate([k * Math.cos(a), k * Math.sin(a), 0], tx, tz + t * 0.12)));
        if (prev) {
          ctx.strokeStyle = rgba(MIST, (p.z + prev.z) / 2 > 0 ? 0.16 : 0.05);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        prev = p;
      }
    });

    // reflection crescent on the lower right
    const cres = ctx.createRadialGradient(cx + r * 0.45, cy + r * 0.5, r * 0.05, cx + r * 0.45, cy + r * 0.5, r * 0.7);
    cres.addColorStop(0, rgba(SIGNAL_LIGHT, 0.32));
    cres.addColorStop(1, rgba(SIGNAL_LIGHT, 0));
    ctx.fillStyle = cres;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    // rim
    ctx.strokeStyle = rgba(MIST, 0.5);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // specular highlight, a soft oval on the upper left
    ctx.save();
    ctx.translate(cx - r * 0.4, cy - r * 0.46);
    ctx.rotate(-0.6);
    ctx.scale(1, 0.62);
    const spec = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.36);
    spec.addColorStop(0, rgba(PAPER, 0.75));
    spec.addColorStop(0.5, rgba(PAPER, 0.18));
    spec.addColorStop(1, rgba(PAPER, 0));
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawOrbit(i: number, front: boolean) {
    let prev = orbitPoint(i, 0);
    for (let j = 1; j <= 96; j++) {
      const p = orbitPoint(i, (j / 96) * Math.PI * 2);
      const z = (p.z + prev.z) / 2;
      if (z > 0 === front) {
        ctx.strokeStyle = rgba(MIST, front ? 0.34 : 0.12);
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      prev = p;
    }
  }

  function drawElectron(i: number) {
    const e = electrons[i];
    const p = electronPos(i);
    const depth = Math.max(0.45, Math.min(1, 0.72 + p.z * 0.4));
    // streak while flying back
    if (e.trail.length > 1) {
      ctx.lineCap = "round";
      for (let k = 1; k < e.trail.length; k++) {
        const f = 1 - k / e.trail.length;
        ctx.strokeStyle = rgba(SIGNAL_LIGHT, 0.45 * f);
        ctx.lineWidth = 5 * f;
        ctx.beginPath();
        ctx.moveTo(e.trail[k - 1].x, e.trail[k - 1].y);
        ctx.lineTo(e.trail[k].x, e.trail[k].y);
        ctx.stroke();
      }
    }
    const grow = e.mode === "held" ? 1 : e.hover;
    const ringR = (13 + 9 * grow) * p.s;
    // soft glow
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, ringR * 1.8);
    glow.addColorStop(0, rgba(SIGNAL_LIGHT, 0.32 * depth));
    glow.addColorStop(1, rgba(SIGNAL_LIGHT, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ringR * 1.8, 0, Math.PI * 2);
    ctx.fill();
    // the cursor look: a thin ring, tinted when hovered, and a solid dot
    if (grow > 0.01) {
      ctx.fillStyle = rgba(SIGNAL_LIGHT, 0.14 * grow);
      ctx.beginPath();
      ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = grow > 0.01 ? rgba(SIGNAL_LIGHT, 0.6 + 0.4 * grow) : rgba(PAPER, 0.55 * depth);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = rgba(PAPER, depth);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.4 * p.s, 0, Math.PI * 2);
    ctx.fill();
  }

  function step(dt: number) {
    if (!reduced) {
      t += dt;
      yaw += dt * 0.08;
    }
    // ease the pointer tilt
    const wantX = pointer.inside && !held ? ((pointer.y - cy) / Math.max(1, H)) * 0.35 : 0;
    const wantY = pointer.inside && !held ? ((pointer.x - cx) / Math.max(1, W)) * 0.5 : 0;
    const ke = 1 - Math.pow(0.05, dt);
    tiltX += (wantX - tiltX) * ke;
    tiltY += (wantY - tiltY) * ke;

    electrons.forEach((e, i) => {
      if (!reduced) e.angle += ORBITS[i].w * dt;
      const home = orbitPoint(i, e.angle);
      if (e.mode === "free") {
        // spring back to the moving orbit position, a little underdamped so it overshoots once
        const k = 42, c = 7.5;
        e.vx += (k * (home.x - e.x) - c * e.vx) * dt;
        e.vy += (k * (home.y - e.y) - c * e.vy) * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.trail.unshift({ x: e.x, y: e.y });
        if (e.trail.length > 12) e.trail.pop();
        if (Math.hypot(home.x - e.x, home.y - e.y) < 2 && Math.hypot(e.vx, e.vy) < 40) {
          e.mode = "orbit";
          e.trail = [];
        }
      } else if (e.mode === "orbit" && e.trail.length) {
        e.trail.pop();
      }
      const near = e.mode === "orbit" && !held && hitTest(pointer.x, pointer.y) === i ? 1 : 0;
      e.hover += (near - e.hover) * (reduced ? 1 : 1 - Math.pow(0.001, dt));
    });
    if (opts.onFly) {
      const flying = electrons.filter((e) => e.mode !== "orbit").map((e) => ({ x: e.x, y: e.y, vx: e.vx, vy: e.vy }));
      if (flying.length) opts.onFly(flying);
    }
  }

  function draw(now: number, once = false) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    step(once ? 0 : dt);
    ctx.clearRect(0, 0, W, H);

    // orbit halves behind the glass, the glass, then the front halves
    ORBITS.forEach((_, i) => drawOrbit(i, false));
    const order = electrons.map((_, i) => i).sort((a, b) => electronPos(a).z - electronPos(b).z);
    order.filter((i) => electronPos(i).z <= 0).forEach(drawElectron);
    drawCore(now);
    ORBITS.forEach((_, i) => drawOrbit(i, true));
    order.filter((i) => electronPos(i).z > 0).forEach(drawElectron);

    const busy = electrons.some((e) => e.mode !== "orbit" || e.trail.length || e.hover > 0.01);
    if (!once && visible && (!reduced || busy)) raf = requestAnimationFrame((n) => draw(n));
    else raf = 0;
  }
  const wake = () => {
    if (!raf && visible) {
      last = 0;
      raf = requestAnimationFrame((n) => draw(n));
    }
  };

  /** Index of the electron under a point in canvas pixels, or -1. Front electrons win. */
  function hitTest(x: number, y: number): number {
    let best = -1, bestZ = -Infinity;
    electrons.forEach((e, i) => {
      if (e.mode === "free") return;
      const p = electronPos(i);
      if (Math.hypot(p.x - x, p.y - y) <= Math.max(24, 20 * p.s) && p.z > bestZ) {
        best = i;
        bestZ = p.z;
      }
    });
    return best;
  }

  const local = (e: { clientX: number; clientY: number }) => {
    const h = host.getBoundingClientRect();
    return { x: e.clientX - h.left, y: e.clientY - h.top };
  };
  const setCursor = (s: "drag" | "hold" | null) => {
    if (s === lastCursor) return;
    lastCursor = s;
    opts.onCursor?.(s);
  };

  const onDown = (ev: PointerEvent) => {
    if (ev.button !== 0) return;
    const p = local(ev);
    const i = hitTest(p.x, p.y);
    if (i < 0) return;
    ev.preventDefault();
    ev.stopPropagation();
    const e = electrons[i];
    const at = electronPos(i);
    e.mode = "held";
    e.x = at.x;
    e.y = at.y;
    e.vx = e.vy = 0;
    e.trail = [];
    held = e;
    grabDX = at.x - p.x;
    grabDY = at.y - p.y;
    samples.length = 0;
    samples.push({ ...p, t: performance.now() });
    try {
      host.setPointerCapture(ev.pointerId);
    } catch {
      /* capture is a nicety */
    }
    setCursor("hold");
    wake();
  };
  const onMove = (ev: PointerEvent) => {
    const p = local(ev);
    pointer = { x: p.x, y: p.y, inside: true };
    if (held) {
      const nx = p.x + grabDX, ny = p.y + grabDY;
      const span = Math.max(0.008, (performance.now() - (samples[samples.length - 1]?.t ?? 0)) / 1000);
      held.vx = (nx - held.x) / span;
      held.vy = (ny - held.y) / span;
      held.x = nx;
      held.y = ny;
      samples.push({ ...p, t: performance.now() });
      while (samples.length > 6) samples.shift();
    } else if (ev.pointerType === "mouse") {
      setCursor(hitTest(p.x, p.y) >= 0 ? "drag" : null);
    }
    if (!reduced || held) wake();
  };
  const onUp = (ev: PointerEvent) => {
    if (!held) return;
    const now = performance.now();
    const recent = samples.filter((s) => now - s.t < 120);
    const a = recent[0], b = recent[recent.length - 1];
    if (a && b && b.t > a.t) {
      const span = (b.t - a.t) / 1000;
      const max = 2600;
      held.vx = Math.max(-max, Math.min(max, (b.x - a.x) / span));
      held.vy = Math.max(-max, Math.min(max, (b.y - a.y) / span));
    }
    held.mode = "free";
    held = null;
    try {
      host.releasePointerCapture(ev.pointerId);
    } catch {
      /* already released */
    }
    const p = local(ev);
    setCursor(ev.pointerType === "mouse" && hitTest(p.x, p.y) >= 0 ? "drag" : null);
    wake();
  };
  const onLeave = () => {
    pointer.inside = false;
    if (!held) setCursor(null);
  };
  // on touch, stop the page from scrolling only when the finger lands on an electron
  const onTouchStart = (ev: TouchEvent) => {
    const touch = ev.touches[0];
    if (touch && hitTest(local(touch).x, local(touch).y) >= 0) ev.preventDefault();
  };

  const ro = new ResizeObserver(measure);
  ro.observe(host);
  ro.observe(anchor);
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) wake();
    else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  io.observe(host);
  const onVis = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else wake();
  };
  document.addEventListener("visibilitychange", onVis);
  host.addEventListener("pointerdown", onDown, true);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);
  host.addEventListener("pointerleave", onLeave);
  host.addEventListener("touchstart", onTouchStart, { passive: false });
  measure();
  if (reduced) draw(performance.now(), true);
  else wake();

  return {
    setReduced(r: boolean) {
      reduced = r;
      if (r) draw(performance.now(), true);
      else wake();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointerdown", onDown, true);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("touchstart", onTouchStart);
      opts.onCursor?.(null);
    },
  };
}
