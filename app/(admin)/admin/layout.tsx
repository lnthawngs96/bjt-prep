import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNoDatabase } from '@/components/admin/AdminNoDatabase';
import { ToastProvider } from '@/components/ui/Toast';
import { getSession } from '@/lib/auth-server';
import { USE_DB } from '@/lib/data/source';

/**
 * Khung quản trị: sidebar dọc trái + nội dung. Không dùng chung layout học viên.
 *
 * proxy.ts đã chắn người chưa đăng nhập, nhưng kiểm VAI TRÒ phải ở đây:
 * proxy chỉ nhìn cookie, không đọc được role. Không phải ADMIN thì về trang chủ.
 */
export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const session = await getSession();
  if (!session) redirect('/login?next=/admin');
  if (session.user.role !== 'ADMIN') redirect('/');

  return (
    <ToastProvider>
      <div className="flex min-h-dvh">
        <AdminSidebar name={session.user.name} initials={initialsOf(session.user.name)} />
        <main className="min-w-0 flex-1">{USE_DB ? children : <AdminNoDatabase />}</main>
      </div>
    </ToastProvider>
  );
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
