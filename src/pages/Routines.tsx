import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Plus, Clock, Layers, Search } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHero } from '@/components/PageHero';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { fmtTime } from '@/lib/format';

export default function Routines() {
  const routines = useStore(s => s.routines);
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => routines.filter(r => r.name.toLowerCase().includes(query.trim().toLowerCase())),
    [routines, query]
  );
  return (
    <AppShell>
      <PageHero
        eyebrow="Library"
        title="Routines"
        subtitle={`${filtered.length} of ${routines.length} ${routines.length === 1 ? 'routine' : 'routines'}`}
        right={
          <Link
            to="/routines/new"
            className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-primary text-primary-foreground tap-scale"
            aria-label="New routine"
          >
            <Plus className="w-4 h-4" />
          </Link>
        }
      />
      <main className="flex-1 px-5 py-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search routines"
            className="pl-9 rounded-2xl bg-card border-border"
          />
        </div>

        {routines.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">No routines yet</p>
            <Link to="/routines/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Plus className="w-4 h-4" /> Create your first routine
            </Link>
          </div>
        )}

        {routines.length > 0 && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No routines match "{query}".</p>
        )}

        {filtered.map((r, idx) => (
          <Link
            key={r.id}
            to={`/routines/${r.id}`}
            className="block p-5 rounded-3xl bg-gradient-card shadow-card tap-scale animate-fade-in-up"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold truncate">{r.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {fmtTime(r.duration)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> {r.sections.length} combos
                </span>
              </div>
            </div>
            {r.sections.length > 0 && (
              <div className="mt-4 flex h-1.5 rounded-full overflow-hidden bg-background-soft">
                {r.sections.map((s, i) => {
                  const w = ((s.end - s.start) / r.duration) * 100;
                  const cls = s.isBreak
                    ? 'bg-muted-foreground/30'
                    : i % 2 === 0
                    ? 'bg-primary'
                    : 'bg-primary/50';
                  return (
                    <div
                      key={s.id}
                      className={cls}
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
