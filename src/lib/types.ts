export type Section = {
  id: string;
  name: string;
  start: number; // seconds
  end: number;   // seconds
};

export type Routine = {
  id: string;
  name: string;
  duration: number; // seconds
  sections: Section[];
  createdAt: number;
};

export type Marker = {
  id: string;
  type: 'mistake' | 'good';
  time: number; // seconds in video
};

export type Emotion = 'nervous' | 'neutral' | 'confident';
export type FailureReason = 'lost_focus' | 'rushed' | 'forgot_sequence' | 'none';

export type Session = {
  id: string;
  routineId: string;
  routineName: string;
  sectionId?: string;
  pressureMode: boolean;
  createdAt: number;
  durationMs: number;
  videoBlobKey?: string; // key in IndexedDB
  markers: Marker[];
  emotion?: Emotion;
  failureReason?: FailureReason;
  insight?: string;
};
