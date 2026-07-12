import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  tx: number;
}

export default function PixelParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate a fixed set of particles with random start values
    const generated: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      size: Math.random() > 0.5 ? 4 : 6, // px size
      delay: Math.random() * 5, // seconds
      duration: 10 + Math.random() * 12, // seconds to traverse screen
      tx: (Math.random() - 0.5) * 80, // horizontal drift
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bg-neon-lime/25"
          style={{
            left: `${p.x}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationName: 'riseUp',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            transform: `translateX(0px)`,
            '--drift-x': `${p.tx}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes riseUp {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-105vh) translateX(var(--drift-x, 40px));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
