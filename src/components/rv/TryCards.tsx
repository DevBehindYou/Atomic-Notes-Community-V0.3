"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ENERGY_RULES, VISIBILITY } from "@/lib/content";
import { Icon, type IconName } from "./Chrome";

// Three demo cards that open like an accordion. Idle: three equal cards. Hovering (or tapping, or Enter on
// a card's title) opens one card across the row and folds the other two into narrow rails. Leaving the
// whole row with the pointer, Escape, or the close button returns all three to idle. Everything here is a
// local demonstration: nothing is sent anywhere and no account is touched.

type CardState = "idle" | "open" | "shut";

type CardProps = {
  index: number;
  state: CardState;
  onOpen: (index: number, focusLab: boolean) => void;
  onClose: () => void;
  setToggle: (index: number, el: HTMLButtonElement | null) => void;
  setLab: (index: number, el: HTMLElement | null) => void;
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Tweens a number for display; the real value updates at once. */
function useTween(value: number, reduced: boolean) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduced) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 400);
      const v = Math.round(a + (value - a) * (1 - Math.pow(1 - t, 3)));
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  return shown;
}

function Card({
  index,
  state,
  onOpen,
  onClose,
  setToggle,
  setLab,
  title,
  icon,
  railMeta,
  badge,
  preview,
  lab,
}: CardProps & {
  title: string;
  icon: IconName;
  railMeta: string;
  badge: string;
  preview: (toggle: ReactNode) => ReactNode;
  lab: ReactNode;
}) {
  const labId = `rv-lab-${index}`;
  const toggle = (
    <button
      ref={(el) => setToggle(index, el)}
      type="button"
      className="rv-card-toggle"
      aria-expanded={state === "open"}
      aria-controls={labId}
      onClick={(e) => {
        e.stopPropagation();
        // A keyboard press arrives as a click with detail 0: move focus into the opened card.
        onOpen(index, e.detail === 0);
      }}
    >
      {title}
    </button>
  );
  return (
    <article
      className="rv-card"
      data-state={state}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") onOpen(index, false);
      }}
      onClick={() => {
        if (state !== "open") onOpen(index, false);
      }}
    >
      <div className="rv-card-default">{preview(toggle)}</div>
      <button
        type="button"
        className="rv-card-rail"
        aria-expanded={false}
        aria-controls={labId}
        aria-label={`Open ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          onOpen(index, e.detail === 0);
        }}
      >
        <span className="rv-rail-icon">
          <Icon name={icon} />
        </span>
        <span className="rv-rail-title">{title}</span>
        <span className="rv-rail-meta">{railMeta}</span>
      </button>
      <div className="rv-card-more">
        <section id={labId} ref={(el) => setLab(index, el)} className="rv-card-lab" aria-label={title}>
          <div className="rv-lab-head">
            <h3>{title}</h3>
            <span className="rv-lab-badge">{badge}</span>
            <button
              type="button"
              className="rv-lab-close"
              aria-label={`Close ${title}`}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <Icon name="close" color="#F4F5F1" size={18} />
            </button>
          </div>
          {lab}
        </section>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ Seal ---------- */

const NOTE_TITLE = "Meeting notes: kickoff";
const NOTE_TEXT = "Budget review moves to Thursday. Ask Priya about the vendor contract.";

const toB64 = (bytes: Uint8Array) => {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
};
const fromB64 = (b64: string) => {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
};

type Sealed = { b64: string; iv: Uint8Array<ArrayBuffer>; bytes: number; tampered: boolean };
type Status = { msg: string; tone?: "good" | "bad" };

function SealCard(props: CardProps) {
  const reduced = useReducedMotion();
  const [text, setText] = useState(NOTE_TEXT);
  const [shown, setShown] = useState(NOTE_TEXT);
  const [phase, setPhase] = useState<"plain" | "sealing" | "sealed" | "opening">("plain");
  const [sealed, setSealed] = useState<Sealed | null>(null);
  const [status, setStatus] = useState<Status>({ msg: "" });
  const key = useRef<CryptoKey | null>(null);
  const original = useRef(NOTE_TEXT);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const morph = (from: string, to: string, done: () => void) => {
    cancelAnimationFrame(raf.current);
    if (reduced) {
      setShown(to);
      done();
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      const k = Math.round(t * to.length);
      setShown(to.slice(0, k) + from.slice(k));
      if (t < 1) raf.current = requestAnimationFrame(step);
      else done();
    };
    raf.current = requestAnimationFrame(step);
  };

  async function seal() {
    if (phase !== "plain") return;
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
      setStatus({ msg: "This browser can't run Web Crypto on this page.", tone: "bad" });
      return;
    }
    if (!text.trim()) {
      setStatus({ msg: "Write a few words to seal first.", tone: "bad" });
      return;
    }
    setPhase("sealing");
    try {
      key.current ??= await subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, key.current, new TextEncoder().encode(text)));
      const b64 = toB64(ct);
      original.current = text;
      setSealed({ b64, iv, bytes: ct.length, tampered: false });
      morph(text, b64, () => {
        setPhase("sealed");
        setStatus({ msg: `Sealed into ${ct.length} bytes: your text plus a 16-byte tag.`, tone: "good" });
      });
    } catch {
      setPhase("plain");
      setStatus({ msg: "Encryption failed in this browser.", tone: "bad" });
    }
  }

  async function open() {
    if (phase !== "sealed" || !sealed || !key.current) return;
    setPhase("opening");
    try {
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: sealed.iv }, key.current, fromB64(sealed.b64));
      const pt = new TextDecoder().decode(plain);
      morph(sealed.b64, pt, () => {
        setText(pt);
        setSealed(null);
        setPhase("plain");
        setStatus({ msg: "Opened with the key in this tab. Your text is unchanged.", tone: "good" });
      });
    } catch {
      setPhase("sealed");
      setStatus({ msg: "The tag check failed, so the note stays shut. GCM caught the changed bit.", tone: "bad" });
    }
  }

  function tamper() {
    if (phase !== "sealed" || !sealed) return;
    const bytes = fromB64(sealed.b64);
    bytes[Math.floor(bytes.length / 2)] ^= 0x01;
    const b64 = toB64(bytes);
    setSealed({ ...sealed, b64, tampered: true });
    setShown(b64);
    setStatus({ msg: "You flipped one bit of the ciphertext. Now try to open it.", tone: "bad" });
  }

  function restart() {
    cancelAnimationFrame(raf.current);
    setText(original.current);
    setShown(original.current);
    setSealed(null);
    setPhase("plain");
    setStatus({ msg: "" });
  }

  const isCipher = phase !== "plain";
  const plainBytes = new TextEncoder().encode(text).length;
  const step = phase === "plain" ? 0 : phase === "sealing" ? 1 : phase === "sealed" ? 2 : 3;
  const pipe = [
    { t: "Plain text on your phone", s: `${plainBytes} bytes anyone holding the file can read` },
    { t: "AES-256-GCM seals it", s: "256-bit key, fresh 12-byte IV every time" },
    { t: "What your Drive stores", s: sealed ? `${sealed.bytes} bytes of ciphertext` : "Nothing sealed yet" },
    { t: "Open with the same key", s: "A wrong key or one changed bit fails the tag check" },
  ];

  const mainAction = phase === "plain" ? seal : open;
  const mainLabel = phase === "sealing" ? "Sealing…" : phase === "opening" ? "Opening…" : isCipher ? "Open with your key" : "Seal it";

  return (
    <Card
      {...props}
      title="Seal a note"
      icon="lock"
      railMeta={isCipher ? "Sealed" : "AES-256-GCM"}
      badge="Real Web Crypto"
      preview={(toggle) => (
        <>
          <div className="rv-try-box">
            <span className="rv-muted" style={{ fontSize: 13 }}>
              {isCipher ? "What your Drive sees" : "What you see"}
            </span>
            <p style={{ fontSize: 18, fontWeight: 600 }}>{NOTE_TITLE}</p>
            <p
              style={
                isCipher
                  ? { fontSize: 13, lineHeight: 1.6, fontFamily: "var(--font-mono), monospace", color: "#8F88FF", overflowWrap: "anywhere" }
                  : { fontSize: 15, lineHeight: 1.6, color: "rgba(244,245,241,.78)", overflowWrap: "anywhere" }
              }
            >
              {shown}
            </p>
          </div>
          <div className="rv-try-foot">
            <h3>{toggle}</h3>
            <p>Watch AES-256-GCM note encryption turn this note into ciphertext before it leaves the phone.</p>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="rv-pill rv-pill-solid"
              style={{ alignSelf: "flex-start" }}
              onClick={() => void mainAction()}
            >
              {mainLabel}
            </button>
          </div>
        </>
      )}
      lab={
        <>
          <div className="rv-lab-grid">
            <div className="rv-lab-col">
              <label htmlFor="rv-seal-text" className="rv-muted" style={{ fontSize: 13 }}>
                {isCipher ? "What your Drive would store, in base64" : "Edit the note and seal it"}
              </label>
              <textarea
                id="rv-seal-text"
                className="rv-note-area"
                data-sealed={isCipher}
                value={isCipher ? shown : text}
                readOnly={isCipher}
                maxLength={280}
                spellCheck={false}
                onChange={(e) => {
                  setText(e.target.value);
                  setShown(e.target.value);
                  setStatus({ msg: "" });
                }}
              />
              <div className="rv-btns">
                <button
                  type="button"
                  className="rv-pill rv-pill-solid"
                  onClick={() => void mainAction()}
                  disabled={phase === "sealing" || phase === "opening"}
                >
                  {mainLabel}
                </button>
                {phase === "sealed" && !sealed?.tampered && (
                  <button type="button" className="rv-pill" onClick={tamper}>
                    Flip one bit
                  </button>
                )}
                {phase === "sealed" && sealed?.tampered && (
                  <button type="button" className="rv-pill" onClick={restart}>
                    Start over
                  </button>
                )}
              </div>
              <p className="rv-status" role="status" data-tone={status.tone}>
                {status.msg}
              </p>
            </div>
            <div className="rv-lab-col rv-lab-side">
              <ol className="rv-pipe" aria-label="What happens to the note">
                {pipe.map((p, i) => (
                  <li key={p.t} data-on={i === step}>
                    <span className="rv-pipe-n">{i + 1}</span>
                    <span>
                      <b>{p.t}</b>
                      <span className="rv-pipe-sub">{p.s}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="rv-lab-note rv-lab-wide">
                This is real AES-256-GCM from your browser&apos;s Web Crypto. Your browser makes a random key, keeps it in
                this tab, and drops it when you leave. In the app, Argon2id builds the key from your six words, on your phone.
              </p>
            </div>
          </div>
        </>
      }
    />
  );
}

/* ---------------------------------------------------------------- Energy ---------- */

const CAP = 120;

function EnergyCard(props: CardProps) {
  const reduced = useReducedMotion();
  const [energy, setEnergy] = useState(80);
  const [clock, setClock] = useState(9 * 60); // minutes since the demo started, day 1 at 09:00
  const [lastStandard, setLastStandard] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ msg: "Starting the day with 80 energy." });
  const [log, setLog] = useState<{ id: number; msg: string; tone?: "good" | "bad" }[]>([]);
  const [shake, setShake] = useState(false);
  const nextId = useRef(0);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shown = useTween(energy, reduced);

  useEffect(() => () => {
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
  }, []);

  const day = Math.floor(clock / 1440) + 1;
  const time = `${String(Math.floor((clock % 1440) / 60)).padStart(2, "0")}:${String(clock % 60).padStart(2, "0")}`;

  const note = (msg: string, tone?: "good" | "bad") => {
    setStatus({ msg, tone });
    setLog((l) => [{ id: nextId.current++, msg: `Day ${day} ${time}  ${msg}`, tone }, ...l].slice(0, 4));
  };
  const refuse = (msg: string) => {
    note(msg, "bad");
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    setShake(true);
    shakeTimer.current = setTimeout(() => setShake(false), 400);
  };

  const sync = () => {
    if (lastStandard !== null && clock - lastStandard < 60) return refuse("Standard sync runs once an hour. Try Instant (10) or skip to the next day.");
    if (energy < 5) return refuse("Not enough energy for a sync. Skip to the next day.");
    setEnergy((e) => e - 5);
    setLastStandard(clock);
    setClock((c) => c + 5);
    note("Standard sync: 5 energy spent.", "good");
  };
  const instant = () => {
    if (energy < 10) return refuse("Not enough energy for an instant sync.");
    setEnergy((e) => e - 10);
    setClock((c) => c + 5);
    note("Instant sync: 10 energy spent.", "good");
  };
  const nextDay = () => {
    const add = Math.min(20, CAP - energy);
    setEnergy((e) => Math.min(CAP, e + 20));
    setClock((c) => (Math.floor(c / 1440) + 1) * 1440 + 9 * 60);
    setLastStandard(null);
    note(add ? `A new day: +${add} energy.` : "A new day, but you're already at the 120 cap.", add ? "good" : undefined);
  };

  const pct = energy / CAP;
  const barColor = energy < 10 ? "#FF8A80" : energy >= 80 ? "#EB7D00" : "#8F88FF";

  const meter = (
    <div className="rv-meter" data-shake={shake}>
      <span style={{ transform: `scaleX(${pct})`, background: barColor }} />
    </div>
  );

  return (
    <Card
      {...props}
      title="Spend a day's energy"
      icon="bolt"
      railMeta={`${energy} / ${CAP}`}
      badge="Local demo"
      preview={(toggle) => (
        <>
          <div className="rv-try-box" style={{ gap: 14 }}>
            <span className="rv-muted" style={{ fontSize: 13 }}>
              Atomic Energy
            </span>
            <p className="rv-poster" style={{ fontSize: 72, lineHeight: 0.85 }}>
              {shown}
              <span className="rv-mono rv-muted" style={{ fontSize: 14 }}>
                {" "}
                / {CAP}
              </span>
            </p>
            {meter}
            <p className="rv-muted" style={{ fontSize: 14 }}>
              {status.msg}
            </p>
          </div>
          <div className="rv-try-foot">
            <h3>{toggle}</h3>
            <p>Writing costs nothing. A standard sync batch costs 5, and +20 arrives every 24 hours.</p>
            <div className="rv-btns" aria-hidden="true">
              <button type="button" tabIndex={-1} className="rv-pill rv-pill-solid" onClick={sync}>
                Sync (5)
              </button>
              <button type="button" tabIndex={-1} className="rv-pill" onClick={nextDay}>
                Next day (+20)
              </button>
            </div>
          </div>
        </>
      )}
      lab={
        <div className="rv-lab-grid">
          <div className="rv-lab-col">
            <p className="rv-muted" style={{ fontSize: 13 }}>
              Day {day}, {time}
            </p>
            <p className="rv-poster" style={{ fontSize: 88, lineHeight: 0.85 }} aria-live="polite">
              {shown}
              <span className="rv-mono rv-muted" style={{ fontSize: 15 }}>
                {" "}
                / {CAP}
              </span>
            </p>
            {meter}
            <p className="rv-status" role="status" data-tone={status.tone}>
              {status.msg}
            </p>
            <div className="rv-btns rv-btns-row" style={{ marginTop: "auto" }}>
              <button type="button" className="rv-pill rv-pill-solid" onClick={sync}>
                Sync (5)
              </button>
              <button type="button" className="rv-pill" onClick={instant}>
                Instant (10)
              </button>
              <button type="button" className="rv-pill" onClick={nextDay}>
                Next day (+20)
              </button>
            </div>
          </div>
          <div className="rv-lab-col rv-lab-side">
            <dl className="rv-rules">
              {ENERGY_RULES.slice(0, 5).map((r) => (
                <div key={r.k}>
                  <dt>{r.k}</dt>
                  <dd>{r.v}</dd>
                </div>
              ))}
            </dl>
            <ul className="rv-log" aria-label="Recent actions">
              {log.map((l) => (
                <li key={l.id} data-tone={l.tone}>
                  {l.msg}
                </li>
              ))}
            </ul>
            <p className="rv-lab-note" style={{ marginTop: "auto" }}>
              A local copy of the app&apos;s rules. Nothing here touches your account or your real energy.
            </p>
          </div>
        </div>
      }
    />
  );
}

/* --------------------------------------------------------------- Privacy ---------- */

function PrivacyCard(props: CardProps) {
  const [vault, setVault] = useState(false);
  const [note, setNote] = useState(NOTE_TEXT);
  const [cipher, setCipher] = useState("");
  const key = useRef<CryptoKey | null>(null);

  // With the vault on, seal whatever is on the phone for real (AES-256-GCM, key made in this tab),
  // so the Drive column shows the actual ciphertext of the visitor's own words.
  useEffect(() => {
    if (!vault) return;
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
      setCipher("(this browser can't run Web Crypto here)");
      return;
    }
    let live = true;
    const t = setTimeout(async () => {
      try {
        key.current ??= await subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt"]);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, key.current, new TextEncoder().encode(`${NOTE_TITLE}\n${note}`)));
        if (live) setCipher(toB64(ct));
      } catch {
        if (live) setCipher("(encryption failed in this browser)");
      }
    }, 120);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [vault, note]);
  const short: [string, string, string][] = [
    ["Your phone", "Everything", "Everything"],
    ["Your Drive", "Readable text", "Ciphertext only"],
    ["Our server", "Metadata only", "Metadata only"],
    ["The developer", "No access", "No access, no key"],
  ];
  const icons: IconName[] = ["phone", "drive", "server", "person"];
  const holds = (i: number): { kind: "plain" | "cipher" | "meta" | "none"; body: ReactNode } => {
    if (i === 0)
      return {
        kind: "plain",
        body: (
          <>
            <label htmlFor="rv-phone-note" style={{ display: "block", fontSize: 13, fontWeight: 700 }}>
              {NOTE_TITLE}
            </label>
            <textarea
              id="rv-phone-note"
              className="rv-phone-note"
              value={note}
              maxLength={110}
              spellCheck={false}
              aria-describedby="rv-phone-hint"
              onChange={(e) => setNote(e.target.value)}
            />
            <span id="rv-phone-hint" className="rv-sr">
              Type your own note. The other columns update as you type.
            </span>
          </>
        ),
      };
    if (i === 1)
      return vault
        ? {
            kind: "cipher",
            body: cipher.length > 120 ? `${cipher.slice(0, 120)}… (${Math.floor((cipher.length * 3) / 4)} bytes)` : cipher || "…",
          }
        : { kind: "plain", body: <>{NOTE_TITLE}. {note || "(empty note)"}</> };
    if (i === 2)
      return {
        kind: "meta",
        body: (
          <>
            Passes through: {vault ? "ciphertext" : "note text"}
            <br />
            Keeps: IDs, timestamps, flags
          </>
        ),
      };
    return { kind: "none", body: vault ? "No access to your files, and no key" : "No access to your Drive files" };
  };

  const toggleVault = () => setVault((v) => !v);

  return (
    <Card
      {...props}
      title="Who can read it"
      icon="eye"
      railMeta={vault ? "Vault on" : "Vault off"}
      badge="Matches the app"
      preview={(toggle) => (
        <>
          <div className="rv-try-box" style={{ padding: "8px 20px", gap: 0 }}>
            {short.map((r, i) => (
              <div
                key={r[0]}
                style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 0", borderBottom: "1px solid rgba(244,245,241,.10)", fontSize: 14 }}
              >
                <span className="rv-muted">{r[0]}</span>
                <span style={{ textAlign: "right", fontWeight: 600, color: vault && i === 1 ? "#8F88FF" : undefined }}>
                  {vault ? r[2] : r[1]}
                </span>
              </div>
            ))}
          </div>
          <div className="rv-try-foot">
            <h3>{toggle}</h3>
            <p>Flip the vault and see what your Drive and our server can read.</p>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="rv-pill rv-pill-solid"
              style={{ alignSelf: "flex-start" }}
              onClick={toggleVault}
            >
              {vault ? "Turn the vault off" : "Turn the vault on"}
            </button>
          </div>
        </>
      )}
      lab={
        <>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
            <button type="button" role="switch" aria-checked={vault} className="rv-switch" onClick={toggleVault}>
              <span className="rv-switch-track" aria-hidden="true" />
              Vault {vault ? "on" : "off"}
            </button>
            <div className="rv-legend" aria-hidden="true">
              <span>
                <i style={{ background: "#F4F5F1" }} />
                Readable
              </span>
              <span>
                <i style={{ background: "#8F88FF" }} />
                Ciphertext
              </span>
              <span>
                <i style={{ background: "#25272D", border: "1px solid rgba(244,245,241,.3)" }} />
                Metadata
              </span>
            </div>
          </div>
          <div className="rv-parties">
            {VISIBILITY.map((v, i) => {
              const h = holds(i);
              return (
                <div className="rv-party" key={v.who}>
                  <span className="rv-party-name">
                    <Icon name={icons[i]} size={18} />
                    {v.who}
                  </span>
                  <div className="rv-holds" data-kind={h.kind}>
                    {h.body}
                  </div>
                  <p className="rv-party-says">{vault ? v.on : v.off}</p>
                </div>
              );
            })}
          </div>
          <p className="rv-lab-note rv-lab-wide">
            {vault
              ? "With the optional end-to-end encrypted vault on, your phone seals each note before upload. Your Drive stores ciphertext, our server carries it without storing it, and the key never leaves your phone."
              : "With the vault off, your Drive holds readable note text, and the text passes through our server on its way there. The server never stores it."}
          </p>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ Row ---------- */

export function TryCards() {
  const [active, setActive] = useState<number | null>(null);
  const row = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const toggles = useRef<(HTMLButtonElement | null)[]>([]);
  const labs = useRef<(HTMLElement | null)[]>([]);
  const focusAfter = useRef<{ index: number; to: "toggle" | "lab" } | null>(null);

  const setToggle = useCallback((i: number, el: HTMLButtonElement | null) => {
    toggles.current[i] = el;
  }, []);
  const setLab = useCallback((i: number, el: HTMLElement | null) => {
    labs.current[i] = el;
  }, []);

  const onOpen = useCallback((i: number, focusLab: boolean) => {
    if (focusLab) focusAfter.current = { index: i, to: "lab" };
    setActive(i);
  }, []);
  const onClose = useCallback(() => {
    setActive((a) => {
      if (a !== null) focusAfter.current = { index: a, to: "toggle" };
      return null;
    });
  }, []);

  // Move focus after the open/close render, so keyboard users land inside the card they opened
  // and back on its title when they close it.
  useEffect(() => {
    const f = focusAfter.current;
    if (!f) return;
    focusAfter.current = null;
    if (f.to === "toggle") {
      toggles.current[f.index]?.focus({ preventScroll: true });
    } else {
      const first = labs.current[f.index]?.querySelector<HTMLElement>(
        "textarea, input, button:not(.rv-lab-close), [role='switch']"
      );
      first?.focus({ preventScroll: true });
    }
  }, [active]);

  // Touch and pen: a tap outside the row closes the open card.
  useEffect(() => {
    if (active === null) return;
    const onDown = (e: PointerEvent) => {
      if (row.current && !row.current.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [active]);

  const stateOf = (i: number): CardState => (active === null ? "idle" : active === i ? "open" : "shut");
  const shared = { onOpen, onClose, setToggle, setLab };

  return (
    <div
      ref={row}
      className="rv-try-row"
      onPointerEnter={() => {
        hovering.current = true;
      }}
      onPointerLeave={(e: ReactPointerEvent) => {
        hovering.current = false;
        if (e.pointerType === "touch") return;
        // Keep the card open while someone is typing in it.
        const el = document.activeElement;
        if (el && row.current?.contains(el) && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) return;
        setActive(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && active !== null) {
          e.stopPropagation();
          onClose();
        }
      }}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (next && !row.current?.contains(next) && !hovering.current) setActive(null);
      }}
    >
      <SealCard index={0} state={stateOf(0)} {...shared} />
      <EnergyCard index={1} state={stateOf(1)} {...shared} />
      <PrivacyCard index={2} state={stateOf(2)} {...shared} />
    </div>
  );
}
