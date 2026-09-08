import { ADMIN_STATUS_LABELS, ADMIN_STATUS_ORDER } from '@/constants/admin/adminLabels';
import type { ContentStatus } from '@/lib/prisma-types';
import { cn } from '@/lib/utils';

const BAR: Record<ContentStatus, string> = {
  PUBLISHED: 'bg-ok',
  DRAFT: 'bg-fg3',
  NEEDS_AUDIO: 'bg-wr',
  NEEDS_REVIEW: 'bg-wr',
  FLAGGED: 'bg-ng',
  ARCHIVED: 'bg-ln',
};

const DOT: Record<ContentStatus, string> = {
  PUBLISHED: 'bg-ok',
  DRAFT: 'bg-fg3',
  NEEDS_AUDIO: 'bg-wr',
  NEEDS_REVIEW: 'bg-wr',
  FLAGGED: 'bg-ng',
  ARCHIVED: 'bg-ln',
};

/** Thanh pipeline 6px: mỗi trạng thái một đoạn, rộng theo số lượng. Theo prototype. */
export function AdminPipelineBar({ counts }: { counts: Partial<Record<ContentStatus, number>> }) {
  const total = ADMIN_STATUS_ORDER.reduce((n, s) => n + (counts[s] ?? 0), 0);
  return (
    <div className="mb-5">
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-sm" role="img" aria-label={`${total} câu theo trạng thái`}>
        {total === 0 ? (
          <span className="flex-1 bg-ln" />
        ) : (
          ADMIN_STATUS_ORDER.filter((s) => (counts[s] ?? 0) > 0).map((s) => (
            <span key={s} style={{ flex: counts[s] }} className={BAR[s]} />
          ))
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg2">
        {ADMIN_STATUS_ORDER.map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <i aria-hidden className={cn('size-1.5 rounded-full', DOT[s])} />
            <b className="tnum font-semibold text-fg">{counts[s] ?? 0}</b> {ADMIN_STATUS_LABELS[s].toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
