import { NextResponse } from 'next/server';
import { submitAttempt } from '@/lib/data/attempts';
import { getSession } from '@/lib/auth-server';
import { submitBodySchema } from '@/lib/validation/attempts';
import type { SubmitError } from '@/lib/data/types';

/**
 * CHẤM ĐIỂM Ở SERVER. Client chỉ gửi lên "tôi chọn phương án nào",
 * server tự tra đáp án. Không bao giờ tin con số đúng/sai do client tính,
 * kể cả khi dữ liệu còn là mock — thiết kế sai bây giờ thì sau phải viết lại.
 *
 * `mode` và `totalQuestions` đọc từ bản ghi Attempt, KHÔNG nhận từ client:
 * nếu không thì ai cũng khai mình đang làm đề 80 câu để lấy điểm thang 800.
 */
const STATUS: Record<SubmitError, number> = {
  NOT_FOUND: 404,
  ALREADY_SUBMITTED: 409,
  TIME_EXCEEDED: 409,
};

const MESSAGE: Record<SubmitError, string> = {
  NOT_FOUND: 'Không tìm thấy lượt làm bài',
  ALREADY_SUBMITTED: 'Lượt này đã được nộp rồi',
  TIME_EXCEEDED: 'Đã quá thời gian làm bài, không nộp được nữa',
};

export async function POST(req: Request, ctx: RouteContext<'/api/attempts/[attemptId]/submit'>) {
  const { attemptId } = await ctx.params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập', code: 'UNAUTHENTICATED' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body không phải JSON hợp lệ' }, { status: 400 });
  }

  const parsed = submitBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Body không hợp lệ', code: 'VALIDATION' }, { status: 400 });
  }

  const result = await submitAttempt({
    attemptId,
    userId: session.user.id,
    answers: parsed.data.answers,
  });

  if ('error' in result) {
    return NextResponse.json(
      { error: MESSAGE[result.error], code: result.error },
      { status: STATUS[result.error] },
    );
  }

  return NextResponse.json(result);
}
