import { SCORING_BANDS, MAX_SCORE } from '@/lib/scoring';
import { cn } from '@/lib/utils';

/**
 * Thước 0–800 với 6 bậc. Bề rộng mỗi bậc tỉ lệ với khoảng điểm của nó,
 * nên J1 (530–599) hẹp hơn J5 (0–199) — phản ánh đúng thang thật.
 */
export function ScoreRuler({ score, className }: { score: number; className?: string }) {
  const current = SCORING_BANDS.find((b) => score >= b.min && score <= b.max) ?? SCORING_BANDS[0];
  const pct = (score / MAX_SCORE) * 100;
  // Chỉ bậc ngay kế tiếp mới hiện mốc điểm — đó là con số học viên cần biết.
  const nextLevel = SCORING_BANDS.find((b) => b.min > score)?.level;

  return (
    <div className={cn('relative pt-5.5', className)}>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded">
        {SCORING_BANDS.map((b) => {
          const width = b.max - b.min + 1;
          const isCurrent = b.level === current.level;
          const isPast = b.max < current.min;
          // Bậc đang đứng: tô gradient đúng tới vị trí điểm, phần còn lại để trống.
          const fill = isCurrent ? ((score - b.min) / width) * 100 : 0;
          return (
            <i
              key={b.level}
              style={{
                flex: width,
                ...(isCurrent
                  ? { background: `linear-gradient(90deg,#1B4FD8 0,#23C9C2 ${fill}%,var(--ln) ${fill}%)` }
                  : undefined),
              }}
              className={cn('h-full', isPast && 'bg-acc-dim', !isCurrent && !isPast && 'bg-ln')}
            />
          );
        })}
      </div>

      <span
        aria-hidden
        style={{ left: `${pct}%` }}
        className="absolute top-4 h-5 w-0.5 -translate-x-1/2 rounded-sm bg-fg"
      />
      <span
        style={{ left: `${pct}%` }}
        className="gt absolute -top-0.5 -translate-x-1/2 text-xs font-bold tabular-nums"
      >
        {score}
      </span>

      <div className="mt-2.5 flex text-xs text-fg3">
        {SCORING_BANDS.map((b) => {
          const isCurrent = b.level === current.level;
          const label = b.level.replace('_PLUS', '+');
          return (
            <span
              key={b.level}
              style={{ flex: b.max - b.min + 1 }}
              className={cn(
                'border-l border-ln pl-1.5',
                isCurrent && 'border-l-acc font-bold text-acc-hi',
              )}
            >
              {label}
              {b.level === nextLevel && ` · ${b.min}`}
            </span>
          );
        })}
      </div>
    </div>
  );
}
