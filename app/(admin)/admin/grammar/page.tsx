import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminGrammarList } from '@/components/admin/AdminGrammarList';
import { getAdminGrammar } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Ngữ pháp · Quản trị' };

export default async function AdminGrammarPage() {
  const rows = await getAdminGrammar();
  return (
    <>
      <AdminPageHeader title="Ngữ pháp" meta={`${rows.length} mẫu`} />
      <AdminContent>
        <AdminGrammarList rows={rows} />
      </AdminContent>
    </>
  );
}
