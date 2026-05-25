import { ReactNode }  from 'react';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  greeting?: string;
  title: ReactNode;
  eyebrow?: string;
  subtitle?: ReactNode;
  right?: ReactNode;
};

function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function PageHero({ greeting, title, eyebrow, subtitle, right }: Props) {
  const { profile, user } = useAuth();
  const name =
    profile?.first_name?.trim() ||
    profile?.display_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'player';
  const hi = greeting ?? `${greetingFor()}, ${name}`;

  return (
    <header className="bg-gradient-hero safe-top px-6 pt-6 pb-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              {eyebrow}
            </p>
          )}
          <p className="text-base font-medium text-foreground/80 truncate">{hi}</p>
          <h1 className="font-display text-[2rem] leading-[1.05] font-extrabold tracking-tight mt-1.5 text-balance">
            {title}
          </h1>
          {subtitle && <p className="text-base text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 pt-1">
          {right}
        </div>
      </div>
    </header>
  );
}
