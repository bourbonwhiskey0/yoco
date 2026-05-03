import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Routine, Session, Section, Marker } from './types';

const uid = () => Math.random().toString(36).slice(2, 10);

type State = {
  routines: Routine[];
  sessions: Session[];
  addRoutine: (data: { name: string; duration: number; sections: Omit<Section, 'id'>[] }) => Routine;
  updateRoutine: (id: string, patch: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  addSession: (s: Omit<Session, 'id' | 'createdAt'>) => Session;
  updateSession: (id: string, patch: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  addMarker: (sessionId: string, type: Marker['type'], time: number) => void;
  removeMarker: (sessionId: string, markerId: string) => void;
};

const sampleRoutine = (): Routine => ({
  id: uid(),
  name: 'Freestyle Demo',
  duration: 180,
  createdAt: Date.now(),
  sections: [
    { id: uid(), name: 'Opening', start: 0, end: 45 },
    { id: uid(), name: 'Mid Combo', start: 45, end: 120 },
    { id: uid(), name: 'Finale', start: 120, end: 180 },
  ],
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      routines: [sampleRoutine()],
      sessions: [],
      addRoutine: ({ name, duration, sections }) => {
        const r: Routine = {
          id: uid(),
          name,
          duration,
          createdAt: Date.now(),
          sections: sections.map(s => ({ ...s, id: uid() })),
        };
        set({ routines: [r, ...get().routines] });
        return r;
      },
      updateRoutine: (id, patch) =>
        set({ routines: get().routines.map(r => (r.id === id ? { ...r, ...patch } : r)) }),
      deleteRoutine: (id) =>
        set({ routines: get().routines.filter(r => r.id !== id) }),
      addSession: (s) => {
        const session: Session = { ...s, id: uid(), createdAt: Date.now() };
        set({ sessions: [session, ...get().sessions] });
        return session;
      },
      updateSession: (id, patch) =>
        set({ sessions: get().sessions.map(s => (s.id === id ? { ...s, ...patch } : s)) }),
      deleteSession: (id) =>
        set({ sessions: get().sessions.filter(s => s.id !== id) }),
      addMarker: (sessionId, type, time) =>
        set({
          sessions: get().sessions.map(s =>
            s.id === sessionId
              ? { ...s, markers: [...s.markers, { id: uid(), type, time }].sort((a, b) => a.time - b.time) }
              : s
          ),
        }),
      removeMarker: (sessionId, markerId) =>
        set({
          sessions: get().sessions.map(s =>
            s.id === sessionId ? { ...s, markers: s.markers.filter(m => m.id !== markerId) } : s
          ),
        }),
    }),
    {
      name: 'yoco-store',
      // Don't persist nothing extra; default is fine.
    }
  )
);
