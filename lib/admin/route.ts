import { NextResponse } from 'next/server';
import type { ZodType } from 'zod';
import { requireAdmin } from '@/lib/auth-server';
import { Prisma } from '@/lib/prisma-server';
import { AdminError } from './errors';

/**
 * Khung chung cho MỌI Route Handler admin. Một chỗ làm bốn việc lặp lại:
 * kiểm quyền → parse JSON → zod → map lỗi Prisma sang mã lỗi của ApiResult.
 *
 * Handler chỉ còn gọi hàm ghi ở lib/data/admin và trả dữ liệu. Tầng ghi ném
 * `AdminError` (lib/admin/errors.ts) để trả một mã lỗi có chủ đích.
 */

const STATUS: Record<AdminError['code'], number> = {
  VALIDATION: 422,
  NOT_FOUND: 404,
  CONFLICT: 409,
  IN_USE: 409,
  FORBIDDEN: 403,
};

type Ctx<P> = { data: P; actorId: string; params: Record<string, string> };
type Handler<P, R> = (ctx: Ctx<P>) => Promise<R>;

function toResponse(e: unknown): NextResponse {
  if (e instanceof AdminError) {
    return NextResponse.json(
      { error: e.message, code: e.code, fieldErrors: e.fieldErrors },
      { status: STATUS[e.code] },
    );
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 trùng khoá duy nhất · P2003 vi phạm khoá ngoại (xoá thứ đang được dùng) · P2025 không tìm thấy
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Trùng giá trị duy nhất', code: 'CONFLICT' }, { status: 409 });
    }
    if (e.code === 'P2003') {
      return NextResponse.json(
        { error: 'Bản ghi đang được tham chiếu, không xoá được', code: 'IN_USE' },
        { status: 409 },
      );
    }
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'Không tìm thấy', code: 'NOT_FOUND' }, { status: 404 });
    }
  }
  console.error('[admin route]', e);
  return NextResponse.json({ error: 'Lỗi máy chủ', code: 'UNKNOWN' }, { status: 500 });
}

/** Chuyển ZodError thành { "options.2.textJa": "…" } để form tô đúng ô. */
function fieldErrorsOf(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = i.path.map(String).join('.') || '_';
    if (!(key in out)) out[key] = i.message;
  }
  return out;
}

type RouteContext = { params: Promise<Record<string, string>> };

/** Route có body: POST, PATCH. */
export function adminRoute<P, R>(schema: ZodType<P>, handler: Handler<P, R>) {
  return async (req: Request, ctx: RouteContext): Promise<NextResponse> => {
    const gate = await requireAdmin();
    if (gate instanceof Response) return gate as NextResponse;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: 'Body không phải JSON hợp lệ', code: 'VALIDATION' }, { status: 400 });
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', code: 'VALIDATION', fieldErrors: fieldErrorsOf(parsed.error.issues) },
        { status: 422 },
      );
    }

    try {
      const data = await handler({ data: parsed.data, actorId: gate.userId, params: await ctx.params });
      return NextResponse.json(data ?? { ok: true });
    } catch (e) {
      return toResponse(e);
    }
  };
}

/** Route không body: GET, DELETE, POST hành động (publish). */
export function adminRouteNoBody<R>(handler: Handler<undefined, R>) {
  return async (_req: Request, ctx: RouteContext): Promise<NextResponse> => {
    const gate = await requireAdmin();
    if (gate instanceof Response) return gate as NextResponse;
    try {
      const data = await handler({ data: undefined, actorId: gate.userId, params: await ctx.params });
      return NextResponse.json(data ?? { ok: true });
    } catch (e) {
      return toResponse(e);
    }
  };
}
