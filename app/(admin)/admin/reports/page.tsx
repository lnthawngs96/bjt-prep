import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminReportList } from '@/components/admin/AdminReportList';
import { getAdminReports } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Báo lỗi · Quản trị' };

export default async function AdminReportsPage() {
  const rows = await getAdminReports();
  const open = rows.filter((r) => r.status === 'open').length;
  return (
    <>
      <AdminPageHeader title="Báo lỗi câu hỏi" meta={`${open} đang mở`} />
      <AdminContent>
        <AdminReportList rows={rows} />
      </AdminContent>
    </>
  );
}
