import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { RoutineForm } from '@/components/RoutineForm';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

const uid = () => Math.random().toString(36).slice(2, 10);

export default function EditRoutine() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const routine = useStore(s => s.routines.find(r => r.id === id));
  const updateRoutine = useStore(s => s.updateRoutine);

  if (!routine) {
    return (
      <AppShell>
        <PageHeader back="/routines" />
        <main className="flex-1 px-6 py-10 text-center text-muted-foreground">Routine not found.</main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Edit routine" back={`/routines/${routine.id}`} />
      <main className="flex-1 px-5 py-4">
        <RoutineForm
          submitLabel="Save changes"
          initial={{
            name: routine.name,
            duration: routine.duration,
            sections: routine.sections,
          }}
          onSubmit={({ name, duration, sections }) => {
            updateRoutine(routine.id, {
              name,
              duration,
              sections: sections.map(s => ({ ...s, id: uid() })),
            });
            toast.success('Routine updated');
            navigate(`/routines/${routine.id}`, { replace: true });
          }}
        />
      </main>
    </AppShell>
  );
}
