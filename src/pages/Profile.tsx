import { useEffect, useState } from 'react';
import { LogOut, Check, Pencil } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHero } from '@/components/PageHero';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const nameSchema = z.string().trim().min(1, 'Name cannot be empty').max(60);

export default function Profile() {
  const sessions = useStore(s => s.sessions);
  const routines = useStore(s => s.routines);
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setName(profile?.display_name ?? ''); }, [profile?.display_name]);

  const totalMs = sessions.reduce((acc, s) => acc + s.durationMs, 0);
  const totalMin = Math.round(totalMs / 60000);

  const save = async () => {
    const parsed = nameSchema.safeParse(name);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ display_name: parsed.data }).eq('id', user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    setEditing(false);
    toast.success('Profile updated');
  };

  return (
    <AppShell>
      <PageHero
        eyebrow="Account"
        title="Profile"
        subtitle="Manage your training identity."
      />
      <main className="flex-1 px-6 py-4 space-y-6">
        <section className="rounded-3xl bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center font-display font-bold text-2xl text-primary-foreground shadow-glow">
              {(profile?.display_name || user?.email || 'Y').slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 rounded-xl bg-background-soft border-border"
                    placeholder="Display name"
                  />
                  <Button size="icon" onClick={save} disabled={saving} className="rounded-xl shrink-0">
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold truncate">
                    {profile?.display_name || 'YoCo Player'}
                  </h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Edit name"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <Stat label="Sessions" value={sessions.length} />
          <Stat label="Minutes" value={totalMin} />
          <Stat label="Routines" value={routines.length} />
        </section>

        <Button
          variant="outline"
          className="w-full h-12 rounded-xl bg-card hover:bg-background-soft"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
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
