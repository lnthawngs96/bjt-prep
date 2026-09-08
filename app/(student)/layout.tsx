import { Header } from '@/components/student/Header';
import { ToastProvider } from '@/components/ui/Toast';
import { getCurrentEstimate } from '@/lib/data/attempts';
import { getDueVocabCount } from '@/lib/data/vocab';
import { getCurrentUser } from '@/lib/data/user';

export default async function StudentLayout({ children }: LayoutProps<'/'>) {
  const [estimate, dueVocabCount, user] = await Promise.all([
    getCurrentEstimate(),
    getDueVocabCount(),
    getCurrentUser(),
  ]);

  return (
    <ToastProvider>
      <Header
        // TODO(auth): Phase 2 đọc từ session Better Auth. Chưa đăng nhập thì
        // getCurrentUser() trả null và header hiện nút Đăng nhập.
        user={user ? { name: user.name, initials: initialsOf(user.name), isAdmin: user.role === 'ADMIN' } : null}
        score={user ? estimate.score : null}
        level={user ? estimate.level : null}
        dueVocabCount={user ? dueVocabCount : 0}
      />
      <main className="min-h-dvh pt-[58px]">{children}</main>
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
