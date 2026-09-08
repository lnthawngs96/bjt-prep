import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminQuestionList } from '@/components/admin/AdminQuestionList';
import { getAdminLookups, getAdminQuestions } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Câu hỏi · Quản trị' };

export default async function AdminQuestionsPage() {
  const [rows, lookups] = await Promise.all([getAdminQuestions(), getAdminLookups()]);
  return (
    <>
      <AdminPageHeader title="Câu hỏi" meta={`${rows.length} câu`} />
      <AdminContent>
        <AdminQuestionList rows={rows} lookups={lookups} />
      </AdminContent>
    </>
  );
}
