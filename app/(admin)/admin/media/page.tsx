import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminMediaList } from '@/components/admin/AdminMediaList';
import { getAdminMedia } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Media · Quản trị' };

export default async function AdminMediaPage() {
  const rows = await getAdminMedia();
  return (
    <>
      <AdminPageHeader title="Media" meta={`${rows.length} file`} />
      <AdminContent>
        <AdminMediaList rows={rows} />
      </AdminContent>
    </>
  );
}
