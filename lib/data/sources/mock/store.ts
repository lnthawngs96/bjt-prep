import type { AttemptAnswer, AttemptMode, Level } from '@/lib/prisma-types';

/**
 * Bộ nhớ tạm phía SERVER cho lượt làm bài phát sinh trong lúc chạy.
 *
 * Giai đoạn giao diện chưa có database, nhưng LUỒNG phải đúng ngay từ bây giờ:
 * mở bài thì tạo một bản ghi có id riêng và userId; client gửi lựa chọn thô lên
 * Route Handler; server chấm rồi cất kết quả; màn kết quả render ở server từ đó.
 * Không bao giờ đẩy đáp án qua client, và không bao giờ suy id từ setId.
 *
 * Hình dạng của StoredAttempt cố ý bám sát model Attempt trong schema, để
 * Phase 4 thay file này bằng Prisma là đổi chỗ lưu chứ không đổi luồng.
 *
 * TODO(db): thay toàn bộ file này bằng bảng Attempt + AttemptAnswer.
 *
 * Giới hạn đã biết: state nằm trong tiến trình Node nên mất khi restart dev
 * server và không chia sẻ giữa nhiều instance. Chấp nhận được ở giai đoạn này
 * vì đây đúng là thứ database sẽ thay.
 */

export interface StoredAttempt {
  id: string;
  userId: string;
  mode: AttemptMode;
  questionSetId: string | null;
  mockTestId: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  timeSpentSec: number | null;
  totalQuestions: number;
  rawCorrect: number;
  estimatedScore: number | null;
  estimatedLevel: Level | null;
  answers: Pick<AttemptAnswer, 'questionId' | 'selectedOptionId' | 'isCorrect'>[];
}

declare global {
  var __bjtAttempts: Map<string, StoredAttempt> | undefined;
}

// globalThis để sống sót qua hot-reload của Next dev.
export const attemptStore: Map<string, StoredAttempt> =
  globalThis.__bjtAttempts ?? new Map<string, StoredAttempt>();

if (process.env.NODE_ENV !== 'production') globalThis.__bjtAttempts = attemptStore;

/**
 * Id ngẫu nhiên cho một lượt làm bài.
 *
 * Đây là chỗ sửa một lỗi thiết kế: trước đây id được suy ra từ setId
 * ("att-" + setId) nên hai học viên làm cùng một bộ sẽ dùng chung id và ghi
 * đè kết quả của nhau. Id phải do server sinh và gắn với userId.
 *
 * TODO(db): bỏ hàm này, để Prisma sinh cuid().
 */
export function newAttemptId(): string {
  return `att_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
