import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { getRanking } from '@/lib/data/user';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Xếp hạng' };

export default async function RankingPage() {
  const rows = await getRanking();

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-10">
      <div className="mb-8">
        <h1 className="mb-2 text-[32px] font-bold tracking-[-.03em]">Xếp hạng</h1>
        <p className="max-w-[62ch] text-[13.5px] text-fg2">
          Theo điểm tham khảo của lần thi thử gần nhất. Chỉ tính người đã làm ít nhất một đề đủ 80
          câu.
        </p>
      </div>

      <ul>
        {rows.map((r) => (
          <li
            key={r.rank}
            className={cn(
              'relative flex items-center gap-4 rounded-lg border-b border-ln px-3 py-3.5 first:border-t',
              r.isMe && 'font-medium',
            )}
          >
            {r.isMe && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-lg bg-(image:--g-soft)"
              />
            )}
            <span
              className={cn(
                'relative w-7 flex-none text-center text-[13px] tabular-nums',
                r.rank <= 3 ? 'gt font-bold' : 'text-fg3',
              )}
            >
              {r.rank}
            </span>
            <span className="relative grid size-8 flex-none place-items-center rounded-full bg-(image:--g) text-[11px] font-bold text-on-g">
              {r.name
                .split(' ')
                .slice(-2)
                .map((w) => w[0])
                .join('')}
            </span>
            <span className="relative min-w-0 flex-1 truncate text-[14px]">
              {r.name}
              {r.isMe && <span className="ml-2 text-[11.5px] text-acc-hi">· bạn</span>}
            </span>
            <span className="relative flex-none">
              <Badge tone={r.isMe ? 'gradient' : 'neutral'}>{r.level.replace('_PLUS', '+')}</Badge>
            </span>
            <span className="relative w-14 flex-none text-right text-[15px] font-semibold tabular-nums">
              {r.score}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[12.5px] text-fg3">
        Bảng xếp hạng dùng dữ liệu mẫu ở giai đoạn này.
      </p>
      <div className="h-40" />
    </div>
  );
}
