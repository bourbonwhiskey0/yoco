import { Link } from 'react-router-dom';
import { Play, Plus, Sparkles, TrendingUp, Video } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHero } from '@/components/PageHero';
import { useStore } from '@/lib/store';
import { fmtTime, relativeTime } from '@/lib/format';

export default function Home() {
  const routines = useStore(s => s.routines);
  const sessions = useStore(s => s.sessions);
  const recent = sessions.slice(0, 4);
  const lastRoutine = routines[0];

  return (
    <AppShell>
      <PageHero
        eyebrow="Today"
        title={<>Ready to <span className="text-primary">level up</span>?</>}
        subtitle="Pick up where you left off."
      />

      <main className="flex-1 px-6 pb-6 space-y-8 pt-2">
        {/* Quick start */}
        <section>
          <Link
            to={lastRoutine ? `/routines/${lastRoutine.id}` : '/routines/new'}
            className="block rounded-3xl bg-gradient-accent p-6 shadow-glow tap-scale relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-primary-foreground/10" />
            <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full bg-primary-foreground/5" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Quick start</p>
                <h2 className="font-display text-xl font-bold text-primary-foreground mt-1">
                  {lastRoutine ? lastRoutine.name : 'Create your first routine'}
                </h2>
                {lastRoutine && (
                  <p className="text-sm text-primary-foreground/80 mt-1">{fmtTime(lastRoutine.duration)} · {lastRoutine.sections.length} sections</p>
                )}
              </div>
              <div className="w-14 h-14 rounded-full bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
                <Play className="w-6 h-6 text-primary-foreground fill-current" />
              </div>
            </div>
          </Link>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3">
          <StatCard icon={<Video className="w-5 h-5" />} label="Sessions" value={sessions.length.toString()} />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Routines" value={routines.length.toString()} />
        </section>

        {/* Recent sessions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Recent sessions</h3>
            {recent.length > 0 && (
              <Link to="/history" className="text-xs text-muted-foreground">View all</Link>
            )}
          </div>

          {recent.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-3">
              {recent.map(s => (
                <li key={s.id}>
                  <Link
                    to={`/review/${s.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-card hover:bg-background-soft transition-colors tap-scale"
                  >
                    <div className="w-12 h-12 rounded-xl bg-background-soft flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{s.routineName}</p>
                      <p className="text-xs text-muted-foreground">
                        {relativeTime(s.createdAt)} · {fmtTime(s.durationMs / 1000)}
                      </p>
                    </div>
                    {s.markers.length > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-background-soft text-muted-foreground">
                        {s.markers.length} marks
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </AppShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="text-primary mb-2">{icon}</div>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="text-sm text-muted-foreground mb-4">No sessions yet. Practice a routine to start building your timeline.</p>
      <Link to="/routines/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
        <Plus className="w-4 h-4" /> Create routine
      </Link>
    </div>
  );
}
