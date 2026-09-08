import { NextResponse } from 'next/server';
import { startAttempt } from '@/lib/data/attempts';
import { getSession } from '@/lib/auth-server';
import type { AttemptMode } from '@/lib/prisma-types';

/**
 * Mở một lượt làm bài. Server sinh id và gắn với userId của phiên đăng nhập.
 *
 * Có endpoint này thay vì để client tự dựng /exam/att-<setId>: id suy ra từ
 * setId thì hai học viên làm cùng một bộ sẽ dùng chung id và ghi đè kết quả
 * của nhau.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    // Client bắt 401 và mở dialog đăng nhập TẠI CHỖ.
    return NextResponse.json({ error: 'Chưa đăng nhập', code: 'UNAUTHENTICATED' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body không phải JSON hợp lệ' }, { status: 400 });
  }

  const { questionSetId, mockTestId } = (body ?? {}) as Record<string, unknown>;
  const setId = typeof questionSetId === 'string' ? questionSetId : null;
  const testId = typeof mockTestId === 'string' ? mockTestId : null;

  if (!setId && !testId) {
    return NextResponse.json({ error: 'Cần questionSetId hoặc mockTestId' }, { status: 400 });
  }

  // Chế độ do server quyết định theo loại đề, không nhận từ client.
  const mode: AttemptMode = testId ? 'MOCK' : 'PRACTICE';
  const result = await startAttempt({
    userId: session.user.id,
    mode,
    questionSetId: setId,
    mockTestId: testId,
  });

  if ('error' in result) {
    return NextResponse.json({ error: 'Đề này chưa có câu hỏi nào', code: 'EMPTY' }, { status: 409 });
  }

  return NextResponse.json(result, { status: 201 });
}
