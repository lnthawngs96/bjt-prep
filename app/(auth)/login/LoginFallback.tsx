'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginDialog } from '@/components/shared/LoginDialog';
import { useAuthDialog } from '@/lib/store/authDialog';

/**
 * Mở đúng dialog đã duyệt trên nền trống. Dùng lại chính component đó chứ
 * không dựng một giao diện đăng nhập thứ hai — hai bản sẽ lệch nhau theo thời gian.
 */
export function LoginFallback({
  callbackURL,
  googleConfigured,
}: {
  callbackURL: string;
  googleConfigured: boolean;
}) {
  const show = useAuthDialog((s) => s.show);
  const router = useRouter();

  useEffect(() => {
    show({ callbackURL });
  }, [show, callbackURL]);

  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <LoginDialog googleConfigured={googleConfigured} />
      {/* Đóng dialog ở trang này thì quay về trang chủ, không để lại màn trống. */}
      <CloseWatcher onClosed={() => router.push('/')} />
    </main>
  );
}

function CloseWatcher({ onClosed }: { onClosed: () => void }) {
  const open = useAuthDialog((s) => s.open);
  useEffect(() => {
    if (!open) {
      const id = setTimeout(onClosed, 150);
      return () => clearTimeout(id);
    }
  }, [open, onClosed]);
  return null;
}
