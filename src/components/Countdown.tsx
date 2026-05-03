import { useEffect, useState } from 'react';

export function Countdown({ from = 3, onDone }: { from?: number; onDone: () => void }) {
  const [n, setN] = useState(from);

  useEffect(() => {
    if (n <= 0) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [n, onDone]);

  return (
    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
        <div className="relative w-44 h-44 rounded-full bg-gradient-accent shadow-glow flex items-center justify-center">
          <span
            key={n}
            className="font-display text-7xl font-bold text-primary-foreground animate-countdown-pop"
          >
            {n > 0 ? n : 'GO'}
          </span>
        </div>
      </div>
    </div>
  );
}
