import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  title?: string;
  back?: boolean | string;
  right?: ReactNode;
  className?: string;
  transparent?: boolean;
};

export function PageHeader({ title, back, right, className, transparent }: Props) {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        'sticky top-0 z-30 safe-top',
        transparent ? 'bg-transparent' : 'glass border-b border-border/50',
        className
      )}
    >
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="w-10">
          {back && (
            <button
              onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-background-soft tap-scale"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>
        {title && <h1 className="font-display text-base font-semibold">{title}</h1>}
        <div className="w-10 flex justify-end">{right}</div>
      </div>
    </header>
  );
}
