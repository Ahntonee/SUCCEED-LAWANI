import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Standalone utilities (used by Home.tsx, Music.tsx, future pages) ─────────

export function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

export function downloadTrack(audioUrl: string, title: string): void {
  if (!audioUrl) return;
  const url = audioUrl.includes('cloudinary')
    ? audioUrl.replace('/upload/', '/upload/fl_attachment/')
    : audioUrl;
  const a = document.createElement('a');
  a.href = url;
  a.download = title;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Manages the HTMLAudioElement lifecycle, progress state, and seek.
// isPlaying state and the play/pause effect intentionally stay in the calling
// component so their effect order relative to the track-change effect is
// controlled by the component (matching the pre-refactor behaviour).

export function useAudioPlayer(onEnded: () => void, onError?: () => void) {
  const [progress,    setProgress]    = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const callbackRef = useRef({ onEnded, onError });
  // Always keep callbacks current without re-creating the audio element
  useEffect(() => { callbackRef.current = { onEnded, onError }; });

  // Create the audio element exactly once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onended  = () => { callbackRef.current.onEnded(); };
    audio.onerror  = () => { callbackRef.current.onError?.(); };

    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // Reset displayed progress when a new track is loaded
  const resetProgress = useCallback(() => {
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  }, []);

  return { progress, currentTime, duration, audioRef, seek, resetProgress };
}
