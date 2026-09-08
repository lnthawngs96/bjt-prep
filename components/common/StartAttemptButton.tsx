'use client';

import { useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { handlePostAttempts } from '@/services/api/common/attemptsApi';
import { useAuthDialog } from '@/stores/common/authDialogStore';
import { cn } from '@/lib/utils';

export interface StartAttemptButtonProps {
  questionSetId?: string;
  mockTestId?: string;
  children: ReactNode;
  className?: string;
  /** Nếu có, thay children trong lúc đang mở bài. Bỏ trống thì giữ nguyên children. */
  loadingLabel?: string;
}

/**
 * Mở lượt làm bài qua API rồi mới điều hướng.
 *
 * KHÔNG dùng <Link href={`/exam/att-${setId}`}>: id suy từ setId thì hai học
 * viên làm cùng một bộ sẽ dùng chung lượt và ghi đè kết quả của nhau.
 */
export function StartAttemptButton({
  questionSetId,
  mockTestId,
  children,
  className,
  loadingLabel,
}: StartAttemptButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const showLogin = useAuthDialog((s) => s.show);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    const result = await handlePostAttempts({ questionSetId, mockTestId });
    setLoading(false);

    if (result.ok) {
      router.push(`/exam/${result.data.attemptId}`);
      return;
    }

    switch (result.code) {
      // Chưa đăng nhập: mở dialog TẠI CHỖ và quay lại đúng trang này sau đó.
      // Không điều hướng sang /login — người dùng đang xem dở danh sách bộ.
      case 'UNAUTHENTICATED':
        showLogin({
          callbackURL: pathname,
          reason: 'Đăng nhập để lưu kết quả bài làm và theo dõi tiến độ của bạn.',
        });
        return;
      case 'EMPTY':
        toast('Đề này chưa có câu hỏi nào.', 'wr');
        return;
      case 'NETWORK':
        toast('Mất kết nối. Kiểm tra mạng rồi thử lại.', 'ng');
        return;
      default:
        toast('Không mở được bài làm. Thử lại giúp tôi nhé.', 'ng');
    }
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={loading}
      aria-busy={loading || undefined}
      className={cn('cursor-pointer disabled:cursor-not-allowed disabled:opacity-60', className)}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
