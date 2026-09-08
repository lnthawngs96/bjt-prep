import { Header } from '@/components/layout/Header';
import { LoginDialog } from '@/components/login/LoginDialog';
import { ToastProvider } from '@/components/ui/Toast';
import { getSession } from '@/lib/auth-server';
import { isGoogleConfigured } from '@/lib/auth';
import { getCurrentEstimate } from '@/lib/data/attempts';
import { getDueVocabCount } from '@/lib/data/vocab';

export default async function StudentLayout({ children }: LayoutProps<'/'>) {
  const session = await getSession();
  const user = session?.user ?? null;

  // Số liệu cá nhân chỉ có ý nghĩa khi đã đăng nhập.
  const [estimate, dueVocabCount] = user
    ? await Promise.all([getCurrentEstimate(user.id), getDueVocabCount(user.id)])
    : [null, 0];

  return (
    <ToastProvider>
      <Header
        user={
          user
            ? {
                name: user.name,
                initials: initialsOf(user.name),
                isAdmin: user.role === 'ADMIN',
              }
            : null
        }
        score={estimate?.score ?? null}
        level={estimate?.level ?? null}
        dueVocabCount={dueVocabCount}
      />
      <main className="min-h-dvh pt-14">{children}</main>
      {/* Một dialog duy nhất cho cả app, mở từ bất kỳ đâu qua useAuthDialog(). */}
      <LoginDialog googleConfigured={isGoogleConfigured} />
    </ToastProvider>
  );
}

/** "Minh Anh" → "MA". Lấy hai từ cuối vì tên Việt xếp họ trước. */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
