import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminMockTestList } from '@/components/admin/AdminMockTestList';
import { getAdminLookups, getAdminMockTests } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Đề thi thử · Quản trị' };

export default async function AdminMockTestsPage() {
  const [rows, lookups] = await Promise.all([getAdminMockTests(), getAdminLookups()]);
  return (
    <>
      <AdminPageHeader title="Đề thi thử" meta={`${rows.length} đề`} />
      <AdminContent>
        <AdminMockTestList rows={rows} lookups={lookups} />
      </AdminContent>
    </>
  );
}
