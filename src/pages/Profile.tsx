import { useEffect, useRef, useState } from 'react';
import { LogOut, Check, Pencil, Camera, Loader2 } from 'lucide-react';
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
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setName(profile?.display_name ?? ''); }, [profile?.display_name]);


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

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
      cacheControl: '3600', upsert: true, contentType: file.type,
    });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error: updErr } = await supabase
      .from('profiles')
      .update({ avatar_url: pub.publicUrl })
      .eq('id', user.id);
    setUploading(false);
    if (updErr) { toast.error(updErr.message); return; }
    await refreshProfile();
    toast.success('Avatar updated');
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
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-accent flex items-center justify-center font-display font-bold text-2xl text-primary-foreground shadow-glow tap-scale group shrink-0"
              aria-label="Change avatar"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{(profile?.display_name || user?.email || 'Y').slice(0, 1).toUpperCase()}</span>
              )}
              <span className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Camera className="w-5 h-5 text-white" />}
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickAvatar}
            />
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
      <p className="text-[11px] tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
