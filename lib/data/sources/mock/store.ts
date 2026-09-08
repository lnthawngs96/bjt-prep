import type { AttemptAnswer } from '@/lib/prisma-types';

/**
 * Bộ nhớ tạm phía SERVER cho những lượt làm bài phát sinh trong lúc chạy.
 *
 * Giai đoạn giao diện chưa có database, nhưng luồng phải đúng ngay từ bây giờ:
 * client gửi lựa chọn thô lên Route Handler, server chấm rồi CẤT KẾT QUẢ,
 * màn kết quả render ở server từ chỗ cất đó. Không đẩy đáp án qua client.
 *
 * TODO(db): thay toàn bộ file này bằng bảng Attempt + AttemptAnswer.
 *
 * Giới hạn đã biết: state nằm trong tiến trình Node nên mất khi restart dev
 * server, và không chia sẻ giữa nhiều instance. Chấp nhận được ở giai đoạn này
 * vì đây đúng là thứ database sẽ thay.
 */

export interface StoredAttempt {
  attemptId: string;
  setId: string;
  correct: number;
  total: number;
  accuracy: number;
  estimatedScore: number | null;
  estimatedLevel: string | null;
  answers: Pick<AttemptAnswer, 'questionId' | 'selectedOptionId' | 'isCorrect'>[];
  finishedAt: Date;
}

declare global {
  var __bjtAttempts: Map<string, StoredAttempt> | undefined;
}

// globalThis để sống sót qua hot-reload của Next dev.
export const attemptStore: Map<string, StoredAttempt> =
  globalThis.__bjtAttempts ?? new Map<string, StoredAttempt>();

if (process.env.NODE_ENV !== 'production') globalThis.__bjtAttempts = attemptStore;
