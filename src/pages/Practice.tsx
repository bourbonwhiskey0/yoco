import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { X, Pause, Play, Square, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { fmtTime } from '@/lib/format';
import { Countdown } from '@/components/Countdown';

export default function Practice() {
  const { routineId = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const routine = useStore(s => s.routines.find(r => r.id === routineId));
  const sectionId = params.get('section') || undefined;
  const pressure = params.get('pressure') === '1';

  const section = useMemo(() => routine?.sections.find(s => s.id === sectionId), [routine, sectionId]);
  const totalSec = section ? section.end - section.start : routine?.duration ?? 0;

  const [phase, setPhase] = useState<'countdown' | 'running' | 'paused' | 'done'>('countdown');
  const [elapsed, setElapsed] = useState(0); // ms
  const startedAt = useRef<number | null>(null);
  const pausedAt = useRef<number>(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== 'running') return;
    startedAt.current = performance.now() - pausedAt.current;
    const tick = () => {
      const now = performance.now();
      const e = now - (startedAt.current ?? now);
      setElapsed(e);
      if (totalSec > 0 && e >= totalSec * 1000) {
        setPhase('done');
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [phase, totalSec]);

  const togglePause = () => {
    if (phase === 'running') {
      pausedAt.current = elapsed;
      setPhase('paused');
    } else if (phase === 'paused') {
      setPhase('running');
    }
  };

  const stop = () => navigate(-1);

  if (!routine) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Routine not found</div>;
  }

  const elapsedSec = elapsed / 1000;
  const currentSection = section
    ? section
    : routine.sections.find(s => elapsedSec >= s.start && elapsedSec < s.end);

  const progress = totalSec > 0 ? Math.min(elapsedSec / totalSec, 1) : 0;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

      {phase === 'countdown' && <Countdown onDone={() => setPhase('running')} />}

      <div className="relative safe-top px-6 py-4 flex items-center justify-between">
        <button onClick={stop} className="w-10 h-10 rounded-full bg-background-soft flex items-center justify-center tap-scale">
          <X className="w-5 h-5" />
        </button>
        {pressure && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-medium">
            <Zap className="w-3.5 h-3.5" /> Pressure
          </span>
        )}
        <div className="w-10" />
      </div>

      <main className="relative px-6 mt-8 flex flex-col items-center text-center">
        <p className="text-xs tracking-widest text-muted-foreground">{section ? 'Combo' : 'Routine'}</p>
        <h1 className="font-display text-2xl font-bold mt-1 text-balance">{section?.name ?? routine.name}</h1>
        {!section && currentSection && (
          <p className="text-sm text-primary mt-1 animate-fade-in">Now: {currentSection.name}</p>
        )}

        {/* Big timer ring */}
        <div className="relative mt-12 w-72 h-72">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--background-soft))" strokeWidth="3" />
            <circle
              cx="50" cy="50" r="46" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-6xl font-bold tabular-nums">
              {fmtTime(elapsedSec)}
            </span>
            {totalSec > 0 && (
              <span className="text-sm text-muted-foreground mt-1 tabular-nums">/ {fmtTime(totalSec)}</span>
            )}
          </div>
        </div>

        {/* Combo dots */}
        {!section && routine.sections.length > 0 && (
          <div className="mt-10 w-full max-w-xs flex gap-1.5">
            {routine.sections.map(s => {
              const w = ((s.end - s.start) / routine.duration) * 100;
              const passed = elapsedSec >= s.end;
              const active = elapsedSec >= s.start && elapsedSec < s.end;
              return (
                <div key={s.id} style={{ width: `${w}%` }} className="h-1.5 rounded-full overflow-hidden bg-background-soft">
                  <div
                    className={`h-full ${
                      s.isBreak
                        ? passed || active ? 'bg-muted-foreground/40' : 'bg-transparent'
                        : passed ? 'bg-primary' : active ? 'bg-primary/70' : 'bg-transparent'
                    }`}
                    style={{ width: passed ? '100%' : active ? `${((elapsedSec - s.start) / (s.end - s.start)) * 100}%` : '0%' }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 safe-bottom">
        <div className="mx-auto max-w-md px-6 py-6 flex items-center justify-center gap-4">
          {phase !== 'done' && phase !== 'countdown' && (
            <button
              onClick={togglePause}
              className="w-16 h-16 rounded-full bg-background-soft flex items-center justify-center tap-scale"
              aria-label={phase === 'running' ? 'Pause' : 'Resume'}
            >
              {phase === 'running' ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
          )}
          <button
            onClick={stop}
            className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow tap-scale"
            aria-label="Stop"
          >
            <Square className="w-7 h-7 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
