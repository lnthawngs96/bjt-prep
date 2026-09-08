import type { Metadata } from 'next';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { getSession } from '@/lib/auth-server';
import { getAdminUsers } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Người dùng · Quản trị' };

export default async function AdminUsersPage() {
  const [rows, session] = await Promise.all([getAdminUsers(), getSession()]);
  return (
    <>
      <AdminPageHeader title="Người dùng" meta={`${rows.length} tài khoản`} />
      <AdminContent>
        <AdminUserList rows={rows} meId={session?.user.id ?? ''} />
      </AdminContent>
    </>
  );
}
