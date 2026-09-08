import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminGroupList } from '@/components/admin/AdminGroupList';
import { getAdminGroups, getAdminLookups } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Nhóm câu · Quản trị' };

export default async function AdminGroupsPage() {
  const [rows, lookups] = await Promise.all([getAdminGroups(), getAdminLookups()]);
  return (
    <>
      <AdminPageHeader title="Nhóm câu (大問)" meta={`${rows.length} nhóm`} />
      <AdminContent>
        <AdminGroupList rows={rows} lookups={lookups} />
      </AdminContent>
    </>
  );
}
