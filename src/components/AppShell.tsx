import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

export function AppShell({ children, className, immersive }: { children: ReactNode; className?: string; immersive?: boolean }) {
  return (
    <div className={cn('min-h-full bg-background text-foreground', className)}>
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        {children}
      </div>
      {!immersive && <div className="h-20" aria-hidden />}
      <BottomNav />
    </div>
  );
}
