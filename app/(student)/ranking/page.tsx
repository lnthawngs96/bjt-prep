import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { getRanking } from '@/lib/data/user';
import { getSession } from '@/lib/auth-server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Xếp hạng' };

export default async function RankingPage() {
  const session = await getSession();
  const rows = await getRanking(session?.user.id ?? null);

  return (
    <div className="pt-10">
      <div className="mb-8 px-6">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Xếp hạng</h1>
        <p className="max-w-prose text-sm text-fg2">
          Theo điểm tham khảo của lần thi thử gần nhất. Chỉ tính người đã làm ít nhất một đề đủ 80
          câu.
        </p>
      </div>

      <ul className="flex flex-col gap-0.5 px-6">
        {rows.map((r) => (
          <li
            key={r.rank}
            className={cn(
              'relative -mx-6 flex items-center gap-4 rounded-lg px-6 py-3.5',
              r.isMe && 'font-medium',
            )}
          >
            {r.isMe && (
              <span aria-hidden className="absolute inset-0 rounded-lg bg-(image:--g-soft)" />
            )}
            <span
              className={cn(
                'relative w-7 flex-none text-center text-sm tabular-nums',
                r.rank <= 3 ? 'gt font-bold' : 'text-fg3',
              )}
            >
              {r.rank}
            </span>
            <span className="relative grid size-8 flex-none place-items-center rounded-full bg-(image:--g) text-xs font-bold text-on-g">
              {r.name
                .split(' ')
                .slice(-2)
                .map((w) => w[0])
                .join('')}
            </span>
            <span className="relative min-w-0 flex-1 truncate text-sm">
              {r.name}
              {r.isMe && <span className="ml-2 text-xs text-acc-hi">· bạn</span>}
            </span>
            <span className="relative flex-none">
              <Badge tone={r.isMe ? 'gradient' : 'neutral'}>{r.level.replace('_PLUS', '+')}</Badge>
            </span>
            <span className="relative w-14 flex-none text-right text-base font-semibold tabular-nums">
              {r.score}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 px-6 text-xs text-fg3">
        Bảng xếp hạng dùng dữ liệu mẫu ở giai đoạn này.
      </p>
      <div className="h-40" />
    </div>
  );
}
