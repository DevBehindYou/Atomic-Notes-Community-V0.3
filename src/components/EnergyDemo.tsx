"use client";

import { useState } from "react";

// Interactive Atomic Energy simulator — the real economy constants, run live in
// the browser so visitors can feel how it works. Nothing here talks to the DB.
const CAP = 120;
const COIN = 40;
const INSTANT = 10;
const STD = 5;
const GRANT = 20;

function color(e: number): string {
  if (e < 10) return "#601D49";
  if (e >= 80) return "#EB7D00";
  return "#3A2FF0";
}

export function EnergyDemo() {
  const [energy, setEnergy] = useState(20);
  const [coins, setCoins] = useState(5);
  const [log, setLog] = useState<string[]>(["+20 daily energy", "+5 welcome coins"]);

  const push = (s: string) => setLog((l) => [s, ...l].slice(0, 6));

  const grant = () => {
    const add = Math.min(GRANT, CAP - energy);
    if (add <= 0) return push("Already at the 120 cap");
    setEnergy((e) => e + add);
    push(`+${add} daily energy`);
  };
  const convert = () => {
    if (coins < 1) return push("No Atomic Coins left");
    if (energy + COIN > CAP) return push("That would overflow the cap");
    setCoins((c) => c - 1);
    setEnergy((e) => e + COIN);
    push(`1 coin → +${COIN} energy`);
  };
  const std = () => {
    if (energy < STD) return push("Not enough energy for standard sync");
    setEnergy((e) => e - STD);
    push(`−${STD} standard (hourly) sync`);
  };
  const instant = () => {
    if (energy < INSTANT) return push("Not enough energy for instant sync");
    setEnergy((e) => e - INSTANT);
    push(`−${INSTANT} instant sync`);
  };
  const reset = () => {
    setEnergy(20);
    setCoins(5);
    setLog(["reset to a fresh account"]);
  };

  const pct = Math.round((energy / CAP) * 100);

  return (
    <div className="module">
      <div className="grid g2" style={{ alignItems: "center" }}>
        <div>
          <p className="num">ATOMIC ENERGY</p>
          <p style={{ fontFamily: "var(--mono)", fontSize: "2.1rem", margin: "4px 0 10px" }}>
            {energy}
            <span style={{ color: "var(--slate)", fontSize: "1rem" }}> / {CAP}</span>
          </p>
          <div className="ebar">
            <span style={{ width: pct + "%", background: color(energy) }} />
          </div>
          <p className="num" style={{ marginTop: 16 }}>
            ATOMIC COINS · {coins}
          </p>
          <p className="mono" style={{ fontSize: ".68rem", color: "var(--slate)", marginTop: 6 }}>
            +20 energy / 24h · cap 120 · 1 coin = 40 · sync 5 (std) / 10 (instant)
          </p>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <button className="btn-ghost" onClick={grant}>
            Daily grant +20
          </button>
          <button className="btn-ghost" onClick={convert}>
            Convert 1 coin (+40)
          </button>
          <button className="btn-ghost" onClick={std}>
            Standard sync −5
          </button>
          <button className="btn-ghost" onClick={instant}>
            Instant sync −10
          </button>
          <button className="btn" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
      <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
        {log.map((l, i) => (
          <div
            key={i}
            className="mono"
            style={{
              fontSize: ".72rem",
              color: i === 0 ? "var(--ink)" : "var(--slate)",
              padding: "2px 0",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
