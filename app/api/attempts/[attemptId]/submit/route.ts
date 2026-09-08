import { NextResponse } from 'next/server';
import { submitAttempt } from '@/lib/data/attempts';
import type { AttemptMode } from '@/lib/prisma-types';

/**
 * CHẤM ĐIỂM Ở SERVER. Client chỉ gửi lên "tôi chọn phương án nào",
 * server tự tra đáp án. Không bao giờ tin con số đúng/sai do client tính,
 * kể cả khi dữ liệu còn là mock — thiết kế sai bây giờ thì sau phải viết lại.
 */
export async function POST(req: Request, ctx: RouteContext<'/api/attempts/[attemptId]/submit'>) {
  const { attemptId } = await ctx.params;

  // TODO(db): kiểm session Better Auth và xác nhận attempt này thuộc về user hiện tại.
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

  // TODO(db): mode lấy từ bản ghi Attempt, không nhận từ client.
  const mode: AttemptMode = 'PRACTICE';
  const result = await submitAttempt({ attemptId, mode, answers: parsed });

  return NextResponse.json(result);
}
