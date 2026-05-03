import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Pause, X, ThumbsUp, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getBlob } from '@/lib/blobStore';
import { fmtTime } from '@/lib/format';
import { Button } from '@/components/ui/button';

export default function Review() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const session = useStore(s => s.sessions.find(x => x.id === sessionId));
  const addMarker = useStore(s => s.addMarker);
  const removeMarker = useStore(s => s.removeMarker);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!session?.videoBlobKey) return;
    let url: string | null = null;
    (async () => {
      const blob = await getBlob(session.videoBlobKey!);
      if (blob) {
        url = URL.createObjectURL(blob);
        setVideoUrl(url);
      }
    })();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [session?.videoBlobKey]);

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Session not found</div>;
  }

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  const seek = (pct: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = duration * pct;
  };

  const mark = (type: 'good' | 'mistake') => {
    addMarker(session.id, type, current);
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 safe-top">
        <div className="px-5 py-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center tap-scale">
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Reviewing</p>
            <p className="text-sm font-medium truncate max-w-[60vw]">{session.routineName}</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Video */}
      <div className="flex-1 flex items-center justify-center" onClick={togglePlay}>
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            className="max-w-full max-h-full"
            onLoadedMetadata={e => setDuration((e.currentTarget.duration || session.durationMs / 1000) || 0)}
            onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : (
          <div className="text-muted-foreground text-sm">Loading video…</div>
        )}

        {!playing && videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
              <Play className="w-8 h-8 text-primary-foreground fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 bg-gradient-to-t from-black via-black/95 to-black/70 pt-6 pb-4 safe-bottom">
        <div className="px-5">
          {/* Timeline */}
          <Timeline
            current={current}
            duration={duration || session.durationMs / 1000}
            markers={session.markers}
            onSeek={seek}
            onRemoveMarker={(id) => removeMarker(session.id, id)}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 tabular-nums">
            <span>{fmtTime(current)}</span>
            <span>{fmtTime(duration || session.durationMs / 1000)}</span>
          </div>

          {/* Marker buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => mark('mistake')}
              className="h-14 rounded-2xl bg-destructive/15 text-destructive font-semibold flex items-center justify-center gap-2 tap-scale active:bg-destructive/25"
            >
              <AlertTriangle className="w-5 h-5" /> Mistake
            </button>
            <button
              onClick={() => mark('good')}
              className="h-14 rounded-2xl bg-primary/15 text-primary font-semibold flex items-center justify-center gap-2 tap-scale active:bg-primary/25"
            >
              <ThumbsUp className="w-5 h-5" /> Good
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-background-soft flex items-center justify-center tap-scale"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <Button onClick={() => navigate(`/reflect/${session.id}`)} className="flex-1 h-12 rounded-2xl gap-2">
              Reflect <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Timeline({
  current, duration, markers, onSeek, onRemoveMarker,
}: {
  current: number;
  duration: number;
  markers: { id: string; type: 'good' | 'mistake'; time: number }[];
  onSeek: (pct: number) => void;
  onRemoveMarker: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const pct = duration > 0 ? Math.min(current / duration, 1) : 0;

  const handle = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(p);
  };

  return (
    <div
      ref={ref}
      className="relative h-10 flex items-center cursor-pointer touch-none"
      onPointerDown={e => { setDragging(true); handle(e.clientX); }}
      onPointerMove={e => { if (dragging) handle(e.clientX); }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      {/* Track */}
      <div className="relative w-full h-1.5 rounded-full bg-background-soft">
        <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${pct * 100}%` }} />
      </div>

      {/* Markers */}
      {markers.map(m => {
        const left = duration > 0 ? (m.time / duration) * 100 : 0;
        return (
          <button
            key={m.id}
            onClick={(e) => { e.stopPropagation(); onRemoveMarker(m.id); }}
            className="absolute -translate-x-1/2 group"
            style={{ left: `${left}%` }}
            aria-label={`Remove ${m.type} marker`}
          >
            <span className={`block w-1 h-6 rounded-full ${m.type === 'good' ? 'bg-primary' : 'bg-destructive'}`} />
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground bg-background px-1 rounded">
              <Trash2 className="w-3 h-3 inline" />
            </span>
          </button>
        );
      })}

      {/* Playhead */}
      <div
        className="absolute w-4 h-4 rounded-full bg-primary border-2 border-background shadow-glow -translate-x-1/2"
        style={{ left: `${pct * 100}%` }}
      />
    </div>
  );
}
