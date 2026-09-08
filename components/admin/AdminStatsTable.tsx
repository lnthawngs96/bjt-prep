'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { AdminFilterBar } from './AdminFilterBar';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { ADMIN_SECTION_SHORT } from '@/constants/admin/adminLabels';
import type { AdminQuestionStat } from '@/lib/data/types';
import { cn } from '@/lib/utils';

/**
 * Tỉ lệ đúng từng câu — KHÔNG dùng để chấm điểm, chỉ để soát nội dung:
 * dưới 10% nhiều khả năng đáp án nhập sai, trên 95% quá dễ.
 */
export function AdminStatsTable({ rows, minAttempts }: { rows: AdminQuestionStat[]; minAttempts: number }) {
  const [onlySuspicious, setOnlySuspicious] = useState(false);
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const visible = rows
    .filter((r) => (!onlySuspicious || r.suspicious) && (!q || r.stemJa.toLowerCase().includes(q)))
    .sort((a, b) => b.attempts - a.attempts);

  return (
    <>
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo câu hỏi…"
        chips={[{ id: 'sus', label: 'Câu nghi vấn', pressed: onlySuspicious, onClick: () => setOnlySuspicious((x) => !x) }]}
      />
      <p className="mb-4 text-xs text-fg3">
        Chỉ đánh dấu nghi vấn khi câu có từ {minAttempts} lượt làm. Tỉ lệ này không dùng để chấm điểm.
      </p>
      {visible.length === 0 ? (
        <AdminEmpty>Chưa có dữ liệu.</AdminEmpty>
      ) : (
        visible.map((r) => (
          <AdminListRow
            key={r.questionId}
            leading={<span className="jp">{ADMIN_SECTION_SHORT[r.sectionCode]}</span>}
            title={<span className="jp font-normal">{r.stemJa}</span>}
            columns={
              <>
                <span className="tnum w-16">{r.attempts} lượt</span>
                <span className="tnum w-14">{r.correct} đúng</span>
              </>
            }
            trailing={
              <>
                <span className={cn('tnum w-12 text-right text-sm font-semibold', r.attempts === 0 ? 'text-fg3' : r.suspicious ? 'text-ng' : 'text-fg')}>
                  {r.attempts === 0 ? '—' : `${Math.round(r.rate * 100)}%`}
                </span>
                {r.suspicious && <Badge tone="ng">Nghi vấn</Badge>}
              </>
            }
          />
        ))
      )}
    </>
  );
}
