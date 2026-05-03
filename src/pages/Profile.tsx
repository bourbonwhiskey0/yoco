import { Link } from 'react-router-dom';
import { Trash2, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useStore } from '@/lib/store';
import { fmtTime, relativeTime } from '@/lib/format';

export default function Profile() {
  const sessions = useStore(s => s.sessions);
  const routines = useStore(s => s.routines);
  const deleteSession = useStore(s => s.deleteSession);

  const totalMs = sessions.reduce((acc, s) => acc + s.durationMs, 0);
  const totalMin = Math.round(totalMs / 60000);
  const totalMarkers = sessions.reduce((acc, s) => acc + s.markers.length, 0);

  return (
    <AppShell>
      <PageHeader title="Profile" />
      <main className="flex-1 px-6 py-4 space-y-6">
        <section className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center font-display font-bold text-2xl text-primary-foreground shadow-glow">
            Y
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">YoCo Player</h1>
            <p className="text-xs text-muted-foreground">Train smart, reflect deep.</p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <Stat label="Sessions" value={sessions.length} />
          <Stat label="Minutes" value={totalMin} />
          <Stat label="Routines" value={routines.length} />
        </section>

        <section>
          <h3 className="font-display font-semibold mb-3">All sessions</h3>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No sessions yet.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.map(s => (
                <li key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card">
                  <Link to={`/review/${s.id}`} className="flex items-center gap-3 flex-1 min-w-0 tap-scale">
                    <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{s.routineName}</p>
                      <p className="text-xs text-muted-foreground">{relativeTime(s.createdAt)} · {fmtTime(s.durationMs / 1000)}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => { if (confirm('Delete session?')) deleteSession(s.id); }}
                    className="w-9 h-9 rounded-xl text-muted-foreground hover:text-destructive flex items-center justify-center"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground">{totalMarkers} markers logged</p>
      </main>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card p-4 text-center">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
