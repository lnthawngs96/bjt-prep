import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatsTable } from '@/components/admin/AdminStatsTable';
import { getAdminQuestionStats, STAT_MIN_ATTEMPTS } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Thống kê · Quản trị' };

export default async function AdminStatsPage() {
  const rows = await getAdminQuestionStats();
  const answered = rows.filter((r) => r.attempts > 0).length;
  return (
    <>
      <AdminPageHeader title="Thống kê câu hỏi" meta={`${answered}/${rows.length} câu đã có lượt làm`} />
      <AdminContent>
        <AdminStatsTable rows={rows} minAttempts={STAT_MIN_ATTEMPTS} />
      </AdminContent>
    </>
  );
}
