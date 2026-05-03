import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Play, Trash2, Zap, Video } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useStore } from '@/lib/store';
import { fmtTime } from '@/lib/format';
import { toast } from 'sonner';

export default function RoutineDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const routine = useStore(s => s.routines.find(r => r.id === id));
  const deleteRoutine = useStore(s => s.deleteRoutine);
  const [pressureMode, setPressureMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);

  if (!routine) {
    return (
      <AppShell>
        <PageHeader back="/routines" />
        <main className="flex-1 px-6 py-10 text-center text-muted-foreground">Routine not found.</main>
      </AppShell>
    );
  }

  const startPractice = (mode: 'practice' | 'record') => {
    const params = new URLSearchParams({ pressure: pressureMode ? '1' : '0' });
    if (selectedSection) params.set('section', selectedSection);
    navigate(`/${mode}/${routine.id}?${params.toString()}`);
  };

  const onDelete = () => {
    if (confirm('Delete this routine?')) {
      deleteRoutine(routine.id);
      toast.success('Routine deleted');
      navigate('/routines', { replace: true });
    }
  };

  return (
    <AppShell>
      <PageHeader back="/routines" right={
        <button onClick={onDelete} className="w-10 h-10 -mr-2 rounded-full hover:bg-background-soft flex items-center justify-center text-muted-foreground hover:text-destructive tap-scale">
          <Trash2 className="w-4 h-4" />
        </button>
      } />
      <main className="flex-1 px-6 py-2 pb-6">
        <section className="animate-fade-in-up">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Routine</p>
          <h1 className="font-display text-3xl font-bold mt-1 text-balance">{routine.name}</h1>
          <p className="text-sm text-muted-foreground mt-2">{fmtTime(routine.duration)} total · {routine.sections.length} sections</p>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold">Sections</h3>
            <button
              onClick={() => setSelectedSection(undefined)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                !selectedSection ? 'bg-primary text-primary-foreground' : 'bg-background-soft text-muted-foreground'
              }`}
            >
              Full routine
            </button>
          </div>

          <ul className="space-y-2">
            {routine.sections.map((s, i) => {
              const active = selectedSection === s.id;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelectedSection(active ? undefined : s.id)}
                    className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-colors tap-scale ${
                      active ? 'bg-primary/15 ring-1 ring-primary' : 'bg-card'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold ${
                      active ? 'bg-primary text-primary-foreground' : 'bg-background-soft text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmtTime(s.start)} – {fmtTime(s.end)} · {fmtTime(s.end - s.start)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
            {routine.sections.length === 0 && (
              <li className="text-sm text-muted-foreground text-center py-6">No sections.</li>
            )}
          </ul>
        </section>

        <section className="mt-8 p-4 rounded-2xl bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Pressure mode</p>
              <p className="text-xs text-muted-foreground">Simulate competition feel</p>
            </div>
          </div>
          <Switch checked={pressureMode} onCheckedChange={setPressureMode} />
        </section>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={() => startPractice('practice')}
            className="h-14 rounded-2xl text-base font-semibold gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> Practice
          </Button>
          <Button
            onClick={() => startPractice('record')}
            className="h-14 rounded-2xl text-base font-semibold gap-2"
          >
            <Video className="w-5 h-5" /> Record
          </Button>
        </div>
      </main>
    </AppShell>
  );
}
