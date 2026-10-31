"use client";

import { useEffect, useRef } from "react";
import { createAtom, type Atom } from "./atomEngine";

/** The 3D atom inside the reactor dial. [level] is the dollar step, 1 to 10; [pulse] flares the core when it changes. */
export function ReactorAtom({ level, pulse, reduced }: { level: number; pulse: number; reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const atomRef = useRef<Atom | null>(null);
  const levelRef = useRef(level);
  levelRef.current = level;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const atom = createAtom(canvas, { reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
    atom.setLevel(levelRef.current);
    atomRef.current = atom;
    return () => {
      atom.destroy();
      atomRef.current = null;
    };
  }, []);

  useEffect(() => {
    atomRef.current?.setLevel(level);
  }, [level]);

  useEffect(() => {
    if (pulse > 0) atomRef.current?.pulse();
  }, [pulse]);

  useEffect(() => {
    atomRef.current?.setReduced(reduced);
  }, [reduced]);

  return <canvas ref={canvasRef} className="rx-atom3d" aria-hidden="true" />;
}
