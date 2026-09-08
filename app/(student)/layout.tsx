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
        score={estimate.score}
        level={estimate.level}
        dueVocabCount={dueVocabCount}
        // TODO(db): Phase 2 đọc role từ session Better Auth thay vì mock.
        isAdmin={user?.role === 'ADMIN'}
      />
      <main className="min-h-dvh pt-[58px]">{children}</main>
    </ToastProvider>
  );
}
