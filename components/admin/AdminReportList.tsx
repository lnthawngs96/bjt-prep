'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AdminEmpty, AdminListRow } from './AdminListRow';
import { ADMIN_SECTION_SHORT } from '@/constants/admin/adminLabels';
import { useAdminMutation } from '@/lib/hooks/useAdminMutation';
import { handlePatchAdminReport } from '@/services/api/admin/usersApi';
import type { AdminReportRow } from '@/lib/data/types';

const REASON: Record<string, string> = {
  wrong_answer: 'Đáp án sai',
  typo: 'Lỗi chính tả',
  audio_broken: 'Audio hỏng',
  unclear: 'Câu không rõ',
  other: 'Khác',
};

export function AdminReportList({ rows }: { rows: AdminReportRow[] }) {
  const resolve = useAdminMutation(handlePatchAdminReport, { successMessage: 'Đã đóng báo lỗi' });

  if (rows.length === 0) return <AdminEmpty>Chưa có báo lỗi nào. Học viên sẽ gửi từ màn kết quả.</AdminEmpty>;

  return (
    <>
      {rows.map((r) => (
        <AdminListRow
          key={r.id}
          leading={<span className="jp">{ADMIN_SECTION_SHORT[r.question.sectionCode]}</span>}
          title={
            <>
              <span className="mr-2">{REASON[r.reason] ?? r.reason}</span>
              <span className="jp font-normal text-fg2">{r.question.stemJa}</span>
            </>
          }
          subtitle={`${r.detail ?? ''}${r.user ? ` — ${r.user.email}` : ''} · ${r.createdAt.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`}
          trailing={
            r.status === 'open' ? (
              <>
                <Button size="sm" disabled={resolve.saving} onClick={() => void resolve.run(r.id, { status: 'resolved' })}>
                  Đã sửa
                </Button>
                <Button size="sm" variant="ghost" disabled={resolve.saving} onClick={() => void resolve.run(r.id, { status: 'rejected' })}>
                  Bỏ qua
                </Button>
              </>
            ) : (
              <Badge tone={r.status === 'resolved' ? 'ok' : 'neutral'}>{r.status === 'resolved' ? 'Đã sửa' : 'Đã bỏ qua'}</Badge>
            )
          }
        />
      ))}
    </>
  );
}
