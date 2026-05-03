import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Trash2, Sparkles, Plus, Search } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { fmtTime, relativeTime } from '@/lib/format';

export default function History() {
  const sessions = useStore(s => s.sessions);
  const deleteSession = useStore(s => s.deleteSession);
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => sessions.filter(s => s.routineName.toLowerCase().includes(query.trim().toLowerCase())),
    [sessions, query]
  );

  return (
    <AppShell>
      <PageHeader title="History" />
      <main className="flex-1 px-6 py-4 space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {filtered.length} of {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </p>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions"
            className="pl-9 rounded-2xl bg-card border-border"
          />
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              No sessions yet. Practice a routine to start building your timeline.
            </p>
            <Link
              to="/routines/new"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              <Plus className="w-4 h-4" /> Create routine
            </Link>
          </div>
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
      </main>
    </AppShell>
  );
}
