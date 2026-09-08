import type { AttemptMode, SectionCode } from '@/lib/prisma-types';
import type { NavigationMode } from '@/lib/data/types';

/**
 * Quy tắc làm bài — logic thuần, KHÔNG phải truy xuất dữ liệu.
 * Để ở đây thay vì lib/data/sources vì nó không bao giờ chạm database,
 * và vì thế cũng không cần async.
 */

const LISTENING_SECTIONS = new Set<string>(['L1', 'L2', 'L3', 'LR1', 'LR2', 'LR3']);

/**
 * BJT thật là CBT tuyến tính: audio phát MỘT LẦN và phần 聴解/聴読解 không
 * lùi lại câu trước được. Chỉ chế độ MOCK mô phỏng điều đó — luyện tập mà
 * không nghe lại được thì rất khó học.
 */
export function navigationModeFor(mode: AttemptMode, sectionCode: SectionCode): NavigationMode {
  if (mode !== 'MOCK') return 'free';
  return LISTENING_SECTIONS.has(sectionCode) ? 'linear' : 'free';
}

/** Audio chỉ phát một lần ở chế độ thi thử. */
export function audioPlayOnce(mode: AttemptMode): boolean {
  return mode === 'MOCK';
}
