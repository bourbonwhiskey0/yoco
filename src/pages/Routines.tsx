import { Link } from 'react-router-dom';
import { Plus, Clock, Layers } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useStore } from '@/lib/store';
import { fmtTime } from '@/lib/format';

export default function Routines() {
  const routines = useStore(s => s.routines);
  return (
    <AppShell>
      <PageHeader
        title="Routines"
        right={
          <Link
            to="/routines/new"
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full bg-primary text-primary-foreground tap-scale"
            aria-label="New routine"
          >
            <Plus className="w-5 h-5" />
          </Link>
        }
      />
      <main className="flex-1 px-5 py-4 space-y-3">
        {routines.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">No routines yet</p>
            <Link to="/routines/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Plus className="w-4 h-4" /> Create your first routine
            </Link>
          </div>
        )}

        {routines.map((r, idx) => (
          <Link
            key={r.id}
            to={`/routines/${r.id}`}
            className="block p-5 rounded-3xl bg-gradient-card shadow-card tap-scale animate-fade-in-up"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold truncate">{r.name}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {fmtTime(r.duration)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> {r.sections.length} sections
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-semibold">
                {r.name.charAt(0).toUpperCase()}
              </div>
            </div>
            {/* Section ribbon */}
            {r.sections.length > 0 && (
              <div className="mt-4 flex h-1.5 rounded-full overflow-hidden bg-background-soft">
                {r.sections.map((s, i) => {
                  const w = ((s.end - s.start) / r.duration) * 100;
                  return (
                    <div
                      key={s.id}
                      className={i % 2 === 0 ? 'bg-primary' : 'bg-primary/50'}
                      style={{ width: `${w}%` }}
                    />
                  );
                })}
              </div>
            )}
          </Link>
        ))}
      </main>
    </AppShell>
  );
}
