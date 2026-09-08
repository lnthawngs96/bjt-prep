import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

/** Phiên đăng nhập hiện tại, null nếu chưa đăng nhập. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Chặn Route Handler của admin.
 *
 * proxy.ts MỘT MÌNH KHÔNG ĐỦ: nó chỉ chắn điều hướng trang, còn ai gọi
 * thẳng vào API vẫn lọt. Mọi endpoint admin phải đi qua hàm này (qua
 * `adminRoute` trong lib/admin/route.ts).
 *
 * Trả về `{ userId }` khi hợp lệ, hoặc một Response để handler trả thẳng ra.
 */
export async function requireAdmin(): Promise<{ userId: string } | Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Chưa đăng nhập', code: 'UNAUTHENTICATED' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Không có quyền truy cập', code: 'FORBIDDEN' }, { status: 403 });
  }
  return { userId: session.user.id };
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user.role === 'ADMIN';
}
