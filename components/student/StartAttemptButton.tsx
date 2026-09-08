'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
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
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionSetId, mockTestId }),
      });

      if (res.status === 409) {
        toast('Đề này chưa có câu hỏi nào.', 'wr');
        return;
      }
      // TODO(db): Phase 2 — 401 thì mở dialog đăng nhập tại chỗ thay vì báo lỗi.
      if (!res.ok) {
        toast('Không mở được bài làm. Thử lại giúp tôi nhé.', 'ng');
        return;
      }

      const { attemptId } = (await res.json()) as { attemptId: string };
      router.push(`/exam/${attemptId}`);
    } catch {
      toast('Mất kết nối. Kiểm tra mạng rồi thử lại.', 'ng');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={loading}
      aria-busy={loading || undefined}
      className={cn('disabled:opacity-60', className)}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
