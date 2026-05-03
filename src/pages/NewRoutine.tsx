import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

type Draft = { name: string; start: string; end: string };

export default function NewRoutine() {
  const navigate = useNavigate();
  const addRoutine = useStore(s => s.addRoutine);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('180');
  const [sections, setSections] = useState<Draft[]>([{ name: '', start: '0', end: '60' }]);

  const addSection = () => {
    const last = sections[sections.length - 1];
    const nextStart = last ? last.end : '0';
    setSections([...sections, { name: '', start: nextStart, end: String(Number(nextStart) + 30) }]);
  };

  const update = (i: number, patch: Partial<Draft>) => {
    setSections(sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const remove = (i: number) => setSections(sections.filter((_, idx) => idx !== i));

  const save = () => {
    if (!name.trim()) return toast.error('Name your routine');
    const dur = Number(duration);
    if (!dur || dur <= 0) return toast.error('Enter a valid duration');
    const cleanSections = sections
      .filter(s => s.name.trim())
      .map(s => ({ name: s.name.trim(), start: Number(s.start) || 0, end: Number(s.end) || 0 }))
      .filter(s => s.end > s.start);
    const r = addRoutine({ name: name.trim(), duration: dur, sections: cleanSections });
    toast.success('Routine created');
    navigate(`/routines/${r.id}`, { replace: true });
  };

  return (
    <AppShell>
      <PageHeader title="New routine" back />
      <main className="flex-1 px-5 py-4 space-y-6">
        <section className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Routine name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Worlds 2026 Freestyle" className="h-12 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dur">Total duration (seconds)</Label>
            <Input id="dur" type="number" inputMode="numeric" value={duration} onChange={e => setDuration(e.target.value)} className="h-12 rounded-2xl" />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold">Sections</h3>
            <button onClick={addSection} className="text-sm text-primary inline-flex items-center gap-1 tap-scale">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <ul className="space-y-3">
            {sections.map((s, i) => (
              <li key={i} className="p-4 rounded-2xl bg-card space-y-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Input
                    value={s.name}
                    onChange={e => update(i, { name: e.target.value })}
                    placeholder={`Section ${i + 1} name`}
                    className="h-11 rounded-xl flex-1"
                  />
                  {sections.length > 1 && (
                    <button onClick={() => remove(i)} className="w-10 h-10 rounded-xl bg-background-soft text-muted-foreground hover:text-destructive tap-scale flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Start (s)</Label>
                    <Input type="number" inputMode="numeric" value={s.start} onChange={e => update(i, { start: e.target.value })} className="h-10 rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End (s)</Label>
                    <Input type="number" inputMode="numeric" value={s.end} onChange={e => update(i, { end: e.target.value })} className="h-10 rounded-xl mt-1" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <Button onClick={save} className="w-full h-14 rounded-2xl text-base font-semibold">
          Save routine
        </Button>
      </main>
    </AppShell>
  );
}
