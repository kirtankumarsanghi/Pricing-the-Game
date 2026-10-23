import type { CSSProperties } from "react";

export interface Burst {
  id: number;
  x: number;
  y: number;
  color: string;
  count?: number;
  spread?: number;
}

const palette = ["#E54826", "#1D4ED8", "#15803D", "#D97706", "#16161A", "#FFFFFF"];

export function ParticleLayer({ bursts }: { bursts: Burst[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true">
      {bursts.map((burst) => {
        const count = burst.count ?? 16;
        return Array.from({ length: count }).map((_, index) => {
          const angle = (Math.PI * 2 * index) / count + (burst.id % 11) * 0.17;
          const distance = 38 + ((index * 41 + burst.id * 13) % (burst.spread ?? 92));
          const dx = Math.cos(angle) * distance;
          const dy = Math.sin(angle) * distance - 22;
          const color = index % 4 === 0 ? burst.color : palette[(index + burst.id) % palette.length];
          const style = {
            left: burst.x,
            top: burst.y,
            backgroundColor: color,
            borderRadius: index % 3 === 0 ? "50%" : index % 3 === 1 ? "2px" : "999px",
            width: index % 5 === 0 ? "6px" : "9px",
            height: index % 5 === 0 ? "6px" : "9px",
            animationDelay: `${(index % 4) * 14}ms`,
            "--dx": `${dx}px`,
            "--dy": `${dy}px`,
            "--rot": `${(index % 2 === 0 ? 1 : -1) * (120 + index * 24)}deg`,
          } as CSSProperties;
          return <span className="particle" key={`${burst.id}-${index}`} style={style} />;
        });
      })}
    </div>
  );
}
