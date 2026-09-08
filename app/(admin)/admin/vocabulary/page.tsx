import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminVocabularyList } from '@/components/admin/AdminVocabularyList';
import { getAdminLookups, getAdminVocab } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Từ vựng · Quản trị' };

export default async function AdminVocabularyPage() {
  const [rows, lookups] = await Promise.all([getAdminVocab(), getAdminLookups()]);
  return (
    <>
      <AdminPageHeader title="Từ vựng" meta={`${rows.length} từ`} />
      <AdminContent>
        <AdminVocabularyList rows={rows} lookups={lookups} />
      </AdminContent>
    </>
  );
}
