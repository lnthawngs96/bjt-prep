import { NextResponse } from 'next/server';
import { submitAttempt } from '@/lib/data/attempts';
import { getSession } from '@/lib/auth-server';

/**
 * CHẤM ĐIỂM Ở SERVER. Client chỉ gửi lên "tôi chọn phương án nào",
 * server tự tra đáp án. Không bao giờ tin con số đúng/sai do client tính,
 * kể cả khi dữ liệu còn là mock — thiết kế sai bây giờ thì sau phải viết lại.
 *
 * `mode` và `totalQuestions` đọc từ bản ghi Attempt, KHÔNG nhận từ client:
 * nếu không thì ai cũng khai mình đang làm đề 80 câu để lấy điểm thang 800.
 */
export async function POST(req: Request, ctx: RouteContext<'/api/attempts/[attemptId]/submit'>) {
  const { attemptId } = await ctx.params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body không phải JSON hợp lệ' }, { status: 400 });
  }

  const answers = (body as { answers?: unknown })?.answers;
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: 'Thiếu trường answers' }, { status: 400 });
  }

  const parsed = answers.flatMap((a) => {
    if (typeof a !== 'object' || a === null) return [];
    const { questionId, selectedOptionId } = a as Record<string, unknown>;
    if (typeof questionId !== 'string') return [];
    return [
      {
        questionId,
        selectedOptionId: typeof selectedOptionId === 'string' ? selectedOptionId : null,
      },
    ];
  });

  const result = await submitAttempt({ attemptId, userId: session.user.id, answers: parsed });
  if (!result) {
    return NextResponse.json({ error: 'Không tìm thấy lượt làm bài' }, { status: 404 });
  }

  return NextResponse.json(result);
}
