import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'ok' | 'ng' | 'wr' | 'neutral' | 'gradient';

const TONES: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok',
  ng: 'bg-ng-soft text-ng',
  wr: 'bg-wr-soft text-wr',
  neutral: 'bg-ln2 text-fg2',
  gradient: 'bg-(image:--g) text-on-g',
};

/** Nhãn trạng thái. Không phải nút — không bấm được, không focus được. */
export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[5px] px-2 py-0.5 text-[11px] font-semibold',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
