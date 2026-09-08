import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSetList } from '@/components/admin/AdminSetList';
import { getAdminLookups, getAdminSets } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Bộ luyện tập · Quản trị' };

export default async function AdminSetsPage() {
  const [rows, lookups] = await Promise.all([getAdminSets(), getAdminLookups()]);
  return (
    <>
      <AdminPageHeader title="Bộ luyện tập" meta={`${rows.length} bộ`} />
      <AdminContent>
        <AdminSetList rows={rows} lookups={lookups} />
      </AdminContent>
    </>
  );
}
