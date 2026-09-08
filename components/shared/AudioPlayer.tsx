'use client';

import { useEffect, useRef, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export interface AudioPlayerProps {
  /** URL đã lấy sẵn qua getPlaybackUrl(mediaId) ở server. */
  src: string;
  /** Mảng peak tính sẵn lúc upload — vẽ sóng không cần tải và phân tích file. */
  waveform?: number[] | null;
  /** Chỉ phát đoạn này. Dùng cho màn xem lại: nghe đúng chỗ đã sai. */
  startMs?: number | null;
  endMs?: number | null;
  /** Chế độ thi thử: audio phát MỘT LẦN, đúng như BJT thật. */
  playOnce?: boolean;
  className?: string;
}

const FALLBACK_WAVE = Array.from({ length: 40 }, (_, i) => 30 + ((i * 37) % 60));

export function AudioPlayer({
  src,
  waveform,
  startMs,
  endMs,
  playOnce = false,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [spent, setSpent] = useState(false);

  const peaks = waveform?.length ? waveform : FALLBACK_WAVE;
  const startS = (startMs ?? 0) / 1000;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    function onTime() {
      if (!el) return;
      const endS = endMs != null ? endMs / 1000 : el.duration;
      if (endMs != null && el.currentTime >= endS) {
        el.pause();
        return;
      }
      const span = (endS || 1) - startS;
      setProgress(span > 0 ? Math.min(1, Math.max(0, (el.currentTime - startS) / span)) : 0);
    }
    function onPlay() {
      setPlaying(true);
    }
    function onPause() {
      setPlaying(false);
    }
    function onEnded() {
      setPlaying(false);
      if (playOnce) setSpent(true);
    }

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
    };
  }, [startS, endMs, playOnce]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      // Ở chế độ thi thử, dừng giữa chừng cũng coi như đã dùng lượt phát.
      if (playOnce) setSpent(true);
      return;
    }
    if (startMs != null && Math.abs(el.currentTime - startS) > 0.3) el.currentTime = startS;
    void el.play();
  }

  const disabled = playOnce && spent && !playing;

  return (
    <div className={cn('flex items-center gap-3.5 rounded-[10px] border border-ln px-4 py-3.5', className)}>
      {/* preload="none": màn kết quả có thể có hàng chục trình phát, để
          "metadata" thì trình duyệt tải hết cùng lúc và treo cả trang.
          Độ dài và hình sóng đã có sẵn từ MediaAsset nên không cần đọc file. */}
      <audio ref={audioRef} src={src} preload="none" />

      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={playing ? 'Tạm dừng' : 'Phát audio'}
        className={cn(
          'grid size-[35px] flex-none place-items-center rounded-full bg-(image:--g) text-on-g',
          'shadow-[0_4px_14px_rgba(35,150,232,.34)] transition-transform duration-200',
          'hover:scale-[1.08] disabled:pointer-events-none disabled:opacity-40',
        )}
      >
        {playing ? <FaPause className="size-3" /> : <FaPlay className="size-3" />}
      </button>

      <div aria-hidden className="flex h-6 flex-1 items-center gap-0.5">
        {peaks.map((h, i) => (
          <i
            key={i}
            style={{ height: `${Math.max(12, h)}%` }}
            className={cn(
              'min-h-[3px] flex-1 rounded-sm transition-colors duration-150',
              i / peaks.length <= progress ? 'bg-(image:--g)' : 'bg-ln',
            )}
          />
        ))}
      </div>

      {playOnce && (
        <span className="flex-none text-[11px] text-fg3">
          {spent ? 'Đã hết lượt phát' : 'Chỉ phát một lần'}
        </span>
      )}
    </div>
  );
}
