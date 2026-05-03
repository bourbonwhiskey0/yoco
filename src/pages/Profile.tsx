import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useStore } from '@/lib/store';

export default function Profile() {
  const sessions = useStore(s => s.sessions);
  const routines = useStore(s => s.routines);

  const totalMs = sessions.reduce((acc, s) => acc + s.durationMs, 0);
  const totalMin = Math.round(totalMs / 60000);

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
