import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { X, Music, Square, Upload, RotateCcw, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { fmtTime } from '@/lib/format';
import { putBlob } from '@/lib/blobStore';
import { Countdown } from '@/components/Countdown';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Phase = 'setup' | 'countdown' | 'recording' | 'done';

export default function Record() {
  const { routineId = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const routine = useStore(s => s.routines.find(r => r.id === routineId));
  const addSession = useStore(s => s.addSession);
  const sectionId = params.get('section') || undefined;
  const pressure = params.get('pressure') === '1';
  const section = routine?.sections.find(s => s.id === sectionId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTime = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>('setup');
  const [elapsed, setElapsed] = useState(0);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicName, setMusicName] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init camera
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch (e: any) {
        setError(e?.message || 'Camera access denied. Please allow permissions.');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
    };
  }, []);

  const onMusicPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setMusicUrl(url);
    setMusicName(f.name);
  };

  const removeMusic = () => {
    if (musicUrl) URL.revokeObjectURL(musicUrl);
    setMusicUrl(null);
    setMusicName(null);
  };

  const onUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !routine) return;
    const key = `vid-${Date.now()}`;
    await putBlob(key, f);
    const session = addSession({
      routineId: routine.id,
      routineName: routine.name,
      sectionId,
      pressureMode: pressure,
      durationMs: 0,
      videoBlobKey: key,
      markers: [],
    });
    streamRef.current?.getTracks().forEach(t => t.stop());
    navigate(`/review/${session.id}`, { replace: true });
  };

  const startCountdown = () => {
    if (!cameraReady) return toast.error('Camera not ready');
    setPhase('countdown');
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : '';
    const recorder = new MediaRecorder(streamRef.current, mime ? { mimeType: mime } : undefined);
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = handleStop;
    recorder.start();
    recorderRef.current = recorder;
    startTime.current = performance.now();
    setPhase('recording');

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    const tick = () => {
      setElapsed(performance.now() - startTime.current);
      tickRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = requestAnimationFrame(tick);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    audioRef.current?.pause();
    if (tickRef.current) cancelAnimationFrame(tickRef.current);
  };

  const handleStop = async () => {
    if (!routine) return;
    const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'video/webm' });
    const key = `vid-${Date.now()}`;
    await putBlob(key, blob);
    const durationMs = performance.now() - startTime.current;
    const session = addSession({
      routineId: routine.id,
      routineName: routine.name,
      sectionId,
      pressureMode: pressure,
      durationMs,
      videoBlobKey: key,
      markers: [],
    });
    streamRef.current?.getTracks().forEach(t => t.stop());
    navigate(`/review/${session.id}`, { replace: true });
  };

  if (!routine) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Routine not found</div>;
  }

  return (
    <div className="relative min-h-screen bg-black text-foreground overflow-hidden">
      {/* Camera preview */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top fade overlay */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {phase === 'countdown' && <Countdown onDone={startRecording} />}

      {/* Top bar */}
      <div className="relative safe-top px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center tap-scale">
          <X className="w-5 h-5" />
        </button>
        {phase === 'recording' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-destructive animate-rec-pulse" />
            <span className="font-display text-sm font-semibold tabular-nums">{fmtTime(elapsed / 1000)}</span>
          </div>
        )}
        <div className="w-10" />
      </div>

      {/* Setup overlay */}
      {phase === 'setup' && (
        <div className="absolute inset-x-0 bottom-0 safe-bottom z-10">
          <div className="mx-5 mb-6 p-5 rounded-3xl glass space-y-4 animate-fade-in-up">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{section ? 'Section' : 'Routine'}</p>
              <h2 className="font-display text-lg font-semibold">{section?.name ?? routine.name}</h2>
            </div>

            {/* Music */}
            <div>
              <label className="block">
                {!musicUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-background-soft border border-dashed border-border cursor-pointer tap-scale">
                    <Music className="w-5 h-5 text-primary" />
                    <span className="text-sm flex-1">Add routine music (optional)</span>
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <input type="file" accept="audio/*" className="hidden" onChange={onMusicPick} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/15">
                    <Music className="w-5 h-5 text-primary" />
                    <span className="text-sm flex-1 truncate">{musicName}</span>
                    <button type="button" onClick={removeMusic} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" asChild className="h-12 rounded-2xl">
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload video
                  <input type="file" accept="video/*" className="hidden" onChange={onUploadVideo} />
                </label>
              </Button>
              <Button onClick={startCountdown} className="h-12 rounded-2xl gap-2" disabled={!cameraReady}>
                <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
                Record
              </Button>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
            {!cameraReady && !error && <p className="text-xs text-muted-foreground text-center">Requesting camera…</p>}
          </div>
        </div>
      )}

      {/* Recording controls */}
      {phase === 'recording' && (
        <div className="absolute inset-x-0 bottom-0 safe-bottom z-10">
          <div className="px-6 py-8 flex items-center justify-center">
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center shadow-glow tap-scale"
              aria-label="Stop recording"
            >
              <Square className="w-7 h-7 fill-current" />
            </button>
          </div>
        </div>
      )}

      {musicUrl && <audio ref={audioRef} src={musicUrl} className="hidden" />}
    </div>
  );
}
