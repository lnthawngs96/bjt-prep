/**
 * BẰNG CHỨNG BIÊN DỊCH cho ranh giới bảo mật.
 *
 * File này không chạy lúc runtime — nó tồn tại để `npm run typecheck` gãy
 * nếu ai đó nới lỏng QuestionForExam.
 *
 * Cách hoạt động: `@ts-expect-error` yêu cầu dòng ngay dưới nó PHẢI có lỗi.
 * Nếu mai kia explanationVi lọt được vào QuestionForExam thì dòng đó hết lỗi,
 * và chính @ts-expect-error trở thành lỗi "unused". Không thể lọt âm thầm.
 *
 * Đừng xoá file này. Nó là thứ duy nhất biến quy tắc trong CLAUDE.md thành
 * ràng buộc mà máy kiểm được.
 */
import type { QuestionForExam, QuestionWithAnswer } from './types';

declare const examQuestion: QuestionForExam;
declare const reviewQuestion: QuestionWithAnswer;

// --- Màn thi KHÔNG được đọc các trường này ---

// @ts-expect-error Giải thích đáp án không bao giờ xuống client trước khi nộp bài.
examQuestion.explanationVi;

// @ts-expect-error Bối cảnh công sở cũng là nội dung sau khi nộp.
examQuestion.businessNoteVi;

// @ts-expect-error Bản dịch tiếng Việt chỉ hiện ở màn hình xem lại.
examQuestion.stemVi;

// @ts-expect-error Tỉ lệ đúng là số liệu soát nội dung nội bộ, không phải của học viên.
examQuestion.correctRate;

// @ts-expect-error Trạng thái duyệt nội dung là việc của admin.
examQuestion.status;

// @ts-expect-error Phương án trong lúc thi chỉ có id, order, textJa — KHÔNG có isCorrect.
examQuestion.options[0].isCorrect;

// @ts-expect-error Vì sao phương án kia sai cũng là nội dung sau khi nộp.
examQuestion.options[0].distractorNote;

// --- Màn xem lại thì đọc được hết, không có lỗi nào ở dưới ---

reviewQuestion.explanationVi;
reviewQuestion.businessNoteVi;
reviewQuestion.stemVi;
reviewQuestion.options[0].isCorrect;
reviewQuestion.options[0].distractorNote;

export {};
