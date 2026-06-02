import { useState } from 'react';
import { Plus, Trash2, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { Section } from '@/lib/types';

type Draft = { name: string; start: string; duration: string; isBreak: boolean };

export type RoutineFormValue = {
  name: string;
  duration: number;
  sections: Omit<Section, 'id'>[];
};

type Props = {
  initial?: {
    name: string;
    duration: number;
    sections: Section[];
  };
  submitLabel: string;
  onSubmit: (value: RoutineFormValue) => void;
};

const toDraft = (s: Section): Draft => ({
  name: s.name,
  start: String(s.start),
  duration: String(Math.max(0, s.end - s.start)),
  isBreak: !!s.isBreak,
});

export function RoutineForm({ initial, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [duration, setDuration] = useState(String(initial?.duration ?? 180));
  const [sections, setSections] = useState<Draft[]>(
    initial?.sections?.length
      ? initial.sections.map(toDraft)
      : [{ name: '', start: '0', duration: '60', isBreak: false }]
  );

  const addSection = (isBreak = false) => {
    const total = Number(duration) || 0;
    const last = sections[sections.length - 1];
    const nextStart = last ? Number(last.start || 0) + Number(last.duration || 0) : 0;
    const remaining = Math.max(0, total - nextStart);
    if (remaining <= 0) {
      toast.error('No time left in routine');
      return;
    }
    const desired = isBreak ? 15 : 30;
    const len = Math.min(desired, remaining);
    setSections([
      ...sections,
      {
        name: isBreak ? 'Break' : '',
        start: String(nextStart),
        duration: String(len),
        isBreak,
      },
    ]);
  };

  const update = (i: number, patch: Partial<Draft>) => {
    const total = Number(duration) || 0;
    setSections(sections.map((s, idx) => {
      if (idx !== i) return s;
      const next = { ...s, ...patch };
      if (patch.duration !== undefined || patch.start !== undefined) {
        const start = Number(next.start) || 0;
        const len = Number(next.duration) || 0;
        const maxLen = Math.max(0, total - start);
        if (len > maxLen) next.duration = String(maxLen);
      }
      return next;
    }));
  };


  const remove = (i: number) => setSections(sections.filter((_, idx) => idx !== i));

  const save = () => {
    if (!name.trim()) return toast.error('Name your routine');
    const dur = Number(duration);
    if (!dur || dur <= 0) return toast.error('Enter a valid duration');
    const cleanSections = sections
      .filter(s => s.name.trim() || s.isBreak)
      .map(s => {
        const start = Number(s.start) || 0;
        const len = Number(s.duration) || 0;
        return {
          name: s.name.trim() || (s.isBreak ? 'Break' : 'Combo'),
          start,
          end: start + len,
          isBreak: s.isBreak,
        };
      })
      .filter(s => s.end > s.start);
    onSubmit({ name: name.trim(), duration: dur, sections: cleanSections });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Routine name</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Worlds 2026 Freestyle"
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dur">Total duration (seconds)</Label>
          <Input
            id="dur"
            type="number"
            inputMode="numeric"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Combos</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => addSection(true)}
              className="text-sm text-muted-foreground inline-flex items-center gap-1 tap-scale"
            >
              <Coffee className="w-4 h-4" /> Break
            </button>
            <button
              onClick={() => addSection(false)}
              className="text-sm text-primary inline-flex items-center gap-1 tap-scale"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        <ul className="space-y-3">
          {sections.map((s, i) => (
            <li
              key={i}
              className={`p-4 rounded-2xl space-y-3 animate-fade-in ${
                s.isBreak ? 'bg-background-soft border border-dashed border-border' : 'bg-card'
              }`}
            >
              <div className="flex items-center gap-2">
                {s.isBreak && <Coffee className="w-4 h-4 text-muted-foreground shrink-0" />}
                <Input
                  value={s.name}
                  onChange={e => update(i, { name: e.target.value })}
                  placeholder={s.isBreak ? 'Break' : `Combo ${i + 1} name`}
                  className="h-11 rounded-xl flex-1"
                />
                {sections.length > 1 && (
                  <button
                    onClick={() => remove(i)}
                    className="w-10 h-10 rounded-xl bg-background-soft text-muted-foreground hover:text-destructive tap-scale flex items-center justify-center"
                    aria-label="Remove combo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Start (s)</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={s.start}
                    onChange={e => update(i, { start: e.target.value })}
                    className="h-10 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duration (s)</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={s.duration}
                    onChange={e => update(i, { duration: e.target.value })}
                    className="h-10 rounded-xl mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  {s.isBreak ? 'Break (no practice)' : 'Practice combo'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Break</span>
                  <Switch
                    checked={s.isBreak}
                    onCheckedChange={(checked) => update(i, { isBreak: checked })}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Button onClick={save} className="w-full h-14 rounded-2xl text-base font-semibold">
        {submitLabel}
      </Button>
    </div>
  );
}
