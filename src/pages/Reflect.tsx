import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Emotion, FailureReason } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { AppShell } from '@/components/AppShell';

const EMOTIONS: { value: Emotion; label: string; emoji: string }[] = [
  { value: 'nervous', label: 'Nervous', emoji: '😰' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'confident', label: 'Confident', emoji: '😎' },
];

const REASONS: { value: FailureReason; label: string }[] = [
  { value: 'lost_focus', label: 'Lost focus' },
  { value: 'rushed', label: 'Rushed' },
  { value: 'forgot_sequence', label: 'Forgot sequence' },
  { value: 'none', label: 'No issues' },
];

function generateInsight(opts: {
  emotion?: Emotion;
  reason?: FailureReason;
  mistakes: number;
  goods: number;
  routineName: string;
  sectionName?: string;
}): string {
  const { emotion, reason, mistakes, goods, sectionName } = opts;
  const where = sectionName ? `the ${sectionName.toLowerCase()} combo` : 'the middle of your routine';

  if (mistakes === 0 && goods > 0) {
    return `Clean run with ${goods} highlight${goods > 1 ? 's' : ''}. Whatever you did to prep — repeat it next time.`;
  }
  if (emotion === 'nervous' && reason === 'rushed') {
    return `You tend to rush transitions when nervous, especially in ${where}. Try a slow breath between combos.`;
  }
  if (reason === 'lost_focus') {
    return `Focus dropped during ${where}. A short pre-combo cue (a word or breath) can anchor your attention.`;
  }
  if (reason === 'forgot_sequence') {
    return `Memory slip in ${where}. Drill that combo in isolation 3× before the next full run.`;
  }
  if (emotion === 'confident' && mistakes > 2) {
    return `Confidence is great, but precision dipped — ${mistakes} mistakes. Slow the tempo by ~10% on your next pass.`;
  }
  return `${mistakes} mistake${mistakes !== 1 ? 's' : ''} vs ${goods} highlight${goods !== 1 ? 's' : ''}. Re-watch the marked moments and run that combo twice.`;
}

export default function Reflect() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const session = useStore(s => s.sessions.find(x => x.id === sessionId));
  const updateSession = useStore(s => s.updateSession);
  const routine = useStore(s => session && s.routines.find(r => r.id === session.routineId));

  const [emotion, setEmotion] = useState<Emotion | undefined>(session?.emotion);
  const [reason, setReason] = useState<FailureReason | undefined>(session?.failureReason);
  const [saved, setSaved] = useState(false);

  const insight = useMemo(() => {
    if (!session) return '';
    return generateInsight({
      emotion,
      reason,
      mistakes: session.markers.filter(m => m.type === 'mistake').length,
      goods: session.markers.filter(m => m.type === 'good').length,
      routineName: session.routineName,
      sectionName: routine?.sections.find(s => s.id === session.sectionId)?.name,
    });
  }, [emotion, reason, session, routine]);

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Session not found</div>;
  }

  const save = () => {
    updateSession(session.id, { emotion, failureReason: reason, insight });
    setSaved(true);
    setTimeout(() => navigate('/', { replace: true }), 900);
  };

  return (
    <AppShell immersive>
      <PageHeader title="Reflect" back />
      <main className="flex-1 px-6 py-4 space-y-7 pb-10">
        <section className="animate-fade-in-up">
          <p className="text-xs tracking-widest text-muted-foreground">Quick reflection</p>
          <h1 className="font-display text-2xl font-bold mt-1 text-balance">How did that feel?</h1>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-3">Emotion</h3>
          <div className="grid grid-cols-3 gap-2">
            {EMOTIONS.map(e => {
              const active = emotion === e.value;
              return (
                <button
                  key={e.value}
                  onClick={() => setEmotion(e.value)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 tap-scale transition-colors ${
                    active ? 'bg-primary/15 ring-1 ring-primary' : 'bg-card'
                  }`}
                >
                  <span className="text-3xl">{e.emoji}</span>
                  <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{e.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-3">What went wrong?</h3>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map(r => {
              const active = reason === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`p-3 rounded-2xl text-sm font-medium tap-scale transition-colors ${
                    active ? 'bg-primary/15 ring-1 ring-primary text-primary' : 'bg-card text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </section>

        {(emotion || reason) && (
          <section className="p-5 rounded-3xl bg-gradient-card border border-primary/20 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold tracking-wider text-primary">YoCo insight</p>
            </div>
            <p className="text-base leading-relaxed text-balance">{insight}</p>
          </section>
        )}

        <Button
          onClick={save}
          disabled={saved}
          className="w-full h-14 rounded-2xl text-base font-semibold gap-2"
        >
          {saved ? (<><Check className="w-5 h-5" /> Saved</>) : 'Save & finish'}
        </Button>
      </main>
    </AppShell>
  );
}
