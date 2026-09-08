import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminMaterialList } from '@/components/admin/AdminMaterialList';
import { getAdminLookups, getAdminMaterials } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Tài liệu · Quản trị' };

export default async function AdminMaterialsPage() {
  const [rows, lookups] = await Promise.all([getAdminMaterials(), getAdminLookups()]);
  return (
    <>
      <AdminPageHeader title="Tài liệu đề bài" meta={`${rows.length} tài liệu`} />
      <AdminContent>
        <AdminMaterialList rows={rows} lookups={lookups} />
      </AdminContent>
    </>
  );
}
