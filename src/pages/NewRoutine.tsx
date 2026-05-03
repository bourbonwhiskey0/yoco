import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { RoutineForm } from '@/components/RoutineForm';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

export default function NewRoutine() {
  const navigate = useNavigate();
  const addRoutine = useStore(s => s.addRoutine);

  return (
    <AppShell>
      <PageHeader title="New routine" back />
      <main className="flex-1 px-5 py-4">
        <RoutineForm
          submitLabel="Save routine"
          onSubmit={({ name, duration, sections }) => {
            const r = addRoutine({ name, duration, sections });
            toast.success('Routine created');
            navigate(`/routines/${r.id}`, { replace: true });
          }}
        />
      </main>
    </AppShell>
  );
}
