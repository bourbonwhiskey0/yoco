import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email').max(255),
  password: z.string().min(6, 'At least 6 characters').max(72),
});

export default function Auth() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [busy, setBusy] = useState(false);

  const signupSchema = schema.extend({
    firstName: z.string().trim().min(1, 'First name is required').max(60),
    lastName: z.string().trim().min(1, 'Last name is required').max(60),
  });

  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [session, navigate]);

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signup') {
        const parsed = signupSchema.safeParse({ email, password, firstName, lastName });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); setBusy(false); return; }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              first_name: parsed.data.firstName,
              last_name: parsed.data.lastName,
              display_name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
            },
          },
        });
        if (error) throw error;
        toast.success('Account created');
      } else {
        const parsed = schema.safeParse({ email, password });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); setBusy(false); return; }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: 'google' | 'apple') => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      toast.error(err?.message ?? `${provider} sign-in failed`);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-hero pt-16 pb-10 px-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-display font-bold text-lg">Y</span>
            </div>
            <span className="font-display font-bold text-lg">YoCo</span>
          </div>
          <p className="text-sm text-muted-foreground">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-balance mt-2">
            {mode === 'signup' ? <>Start your <span className="text-primary">practice journey</span></> : <>Sign in to <span className="text-primary">keep training</span></>}
          </h1>
        </div>
      </div>

      <main className="flex-1 px-6 mx-auto max-w-md w-full pt-2 pb-10 space-y-5">
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl bg-card hover:bg-background-soft"
            onClick={() => oauth('google')}
            disabled={busy}
          >
            <GoogleIcon /> Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl bg-card hover:bg-background-soft"
            onClick={() => oauth('apple')}
            disabled={busy}
          >
            <AppleIcon /> Continue with Apple
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px bg-border flex-1" />
          OR
          <div className="h-px bg-border flex-1" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl bg-card border-border"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl bg-card border-border"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          <Button type="submit" disabled={busy} className="w-full h-12 rounded-xl font-semibold">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'signup' ? 'Create account' : 'Sign in')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'signup' ? 'Already have an account?' : 'New to YoCo?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="text-primary font-medium"
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}
