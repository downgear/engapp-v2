import { memo, useMemo } from "react";
import type { CSSProperties } from "react";

type FxType = "petal" | "bubble" | "sparkle" | "leaf" | "firefly";

interface Particle {
  id: number;
  type: FxType;
  left: number;   // vw %
  top: number;    // vh %  (only used for sparkle / firefly)
  size: number;   // px
  duration: number;
  delay: number;
  hue: number;
  sat: number;
  lit: number;
  alt: boolean;   // pick alternate animation variant
}

interface FloatingEffectsProps {
  /** "full" = all particle types at full count (landing page)
   *  "subtle" = fewer + more transparent (dashboards) */
  intensity?: "full" | "subtle";
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min);

function buildParticles(intensity: "full" | "subtle"): Particle[] {
  const scale = intensity === "subtle" ? 0.5 : 1;
  const list: Particle[] = [];
  let id = 0;

  type Cfg = {
    count: number;
    size: [number, number];
    dur: [number, number];
    delay: [number, number];
    hue: [number, number];
    sat: [number, number];
    lit: [number, number];
  };

  const push = (type: FxType, cfg: Cfg) => {
    const count = Math.ceil(cfg.count * scale);
    for (let i = 0; i < count; i++) {
      list.push({
        id: id++,
        type,
        left: rnd(0, 100),
        top: rnd(5, 90),
        size: rnd(...cfg.size),
        duration: rnd(...cfg.dur),
        delay: rnd(...cfg.delay),
        hue: rnd(...cfg.hue),
        sat: rnd(...cfg.sat),
        lit: rnd(...cfg.lit),
        alt: Math.random() > 0.5,
      });
    }
  };

  // Cherry-blossom petals
  push("petal", {
    count: 20,
    size: [7, 16],
    dur: [10, 18],
    delay: [0, 16],
    hue: [328, 358],
    sat: [70, 90],
    lit: [74, 90],
  });

  // Bubbles
  push("bubble", {
    count: 16,
    size: [8, 28],
    dur: [8, 18],
    delay: [0, 14],
    hue: [140, 185],
    sat: [45, 75],
    lit: [58, 82],
  });

  // Sparkles / 4-pointed stars
  push("sparkle", {
    count: 14,
    size: [8, 18],
    dur: [2.5, 5],
    delay: [0, 9],
    hue: [38, 68],
    sat: [85, 100],
    lit: [60, 80],
  });

  // Leaves
  push("leaf", {
    count: 10,
    size: [9, 18],
    dur: [12, 22],
    delay: [0, 20],
    hue: [90, 155],
    sat: [50, 80],
    lit: [35, 60],
  });

  // Fireflies (gentle float, no drift)
  push("firefly", {
    count: 10,
    size: [4, 9],
    dur: [4, 8],
    delay: [0, 10],
    hue: [85, 145],
    sat: [60, 90],
    lit: [55, 75],
  });

  return list;
}

const FloatingEffects = memo(({ intensity = "full" }: FloatingEffectsProps) => {
  const particles = useMemo(() => buildParticles(intensity), [intensity]);

  const globalOpacity = intensity === "subtle" ? 0.45 : 0.75;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 1, opacity: globalOpacity }}
      aria-hidden="true"
    >
      {particles.map((p) => {
        const color = `hsl(${p.hue} ${p.sat}% ${p.lit}%)`;
        const colorLight = `hsl(${p.hue} ${p.sat}% ${Math.min(p.lit + 22, 95)}%)`;

        /* --- PETAL --- */
        if (p.type === "petal") {
          const anim = p.alt ? "fx-petal-b" : "fx-petal-a";
          const style: CSSProperties = {
            position: "absolute",
            top: "-2%",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.62,
            backgroundColor: color,
            borderRadius: "50% 0 50% 50%",
            opacity: 0,
            animation: `${anim} ${p.duration}s ${p.delay}s infinite ease-in-out`,
            willChange: "transform, opacity",
            boxShadow: `0 0 ${p.size * 0.4}px ${color}55`,
          };
          return <div key={p.id} style={style} />;
        }

        /* --- BUBBLE --- */
        if (p.type === "bubble") {
          const style: CSSProperties = {
            position: "absolute",
            bottom: "-5%",
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            border: `1.5px solid ${color}99`,
            background: `radial-gradient(circle at 32% 28%, ${colorLight}55, ${color}11)`,
            opacity: 0,
            animation: `fx-bubble ${p.duration}s ${p.delay}s infinite ease-in-out`,
            willChange: "transform, opacity",
          };
          return <div key={p.id} style={style} />;
        }

        /* --- SPARKLE (4-pointed star) --- */
        if (p.type === "sparkle") {
          const style: CSSProperties = {
            position: "absolute",
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            clipPath:
              "polygon(50% 0%, 55% 44%, 100% 50%, 55% 56%, 50% 100%, 45% 56%, 0% 50%, 45% 44%)",
            opacity: 0,
            animation: `fx-sparkle ${p.duration}s ${p.delay}s infinite ease-in-out`,
            willChange: "transform, opacity",
            filter: `drop-shadow(0 0 ${p.size * 0.5}px ${color})`,
          };
          return <div key={p.id} style={style} />;
        }

        /* --- LEAF --- */
        if (p.type === "leaf") {
          const anim = p.alt ? "fx-leaf-b" : "fx-leaf-a";
          const style: CSSProperties = {
            position: "absolute",
            top: "-2%",
            left: `${p.left}%`,
            width: p.size * 0.65,
            height: p.size,
            backgroundColor: color,
            borderRadius: p.alt ? "50% 0 50% 0" : "0 50% 0 50%",
            opacity: 0,
            animation: `${anim} ${p.duration}s ${p.delay}s infinite ease-in-out`,
            willChange: "transform, opacity",
          };
          return <div key={p.id} style={style} />;
        }

        /* --- FIREFLY / ORB --- */
        const style: CSSProperties = {
          position: "absolute",
          top: `${p.top}%`,
          left: `${p.left}%`,
          width: p.size,
          height: p.size,
          borderRadius: "50%",
          backgroundColor: color,
          opacity: 0,
          animation: `fx-firefly ${p.duration}s ${p.delay}s infinite ease-in-out`,
          willChange: "transform, opacity",
          filter: `blur(1px) drop-shadow(0 0 ${p.size}px ${color})`,
        };
        return <div key={p.id} style={style} />;
      })}

    </div>
  );
});

FloatingEffects.displayName = "FloatingEffects";
export default FloatingEffects;
