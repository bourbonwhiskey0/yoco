import { NavLink, useLocation } from 'react-router-dom';
import { Home, ListVideo, History as HistoryIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/routines', label: 'Routines', icon: ListVideo },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/profile', label: 'Profile', icon: User },
];

// Hide the bottom nav on immersive screens
const HIDE_ON = ['/practice', '/record', '/review', '/reflect'];

export function BottomNav() {
  const { pathname } = useLocation();
  if (HIDE_ON.some(p => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border safe-bottom">
      <div className="mx-auto max-w-md px-6 py-2 flex justify-around">
        {items.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors tap-scale',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="w-6 h-6" strokeWidth={2} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
