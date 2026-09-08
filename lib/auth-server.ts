import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

/** Phiên đăng nhập hiện tại, null nếu chưa đăng nhập. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Chặn Route Handler và Server Action của admin.
 *
 * Middleware MỘT MÌNH KHÔNG ĐỦ: nó chỉ chắn điều hướng trang, còn ai gọi
 * thẳng vào API vẫn lọt. Mọi endpoint admin phải gọi hàm này.
 *
 * Trả về `null` khi hợp lệ, hoặc một Response để handler trả thẳng ra.
 */
export async function requireAdmin(): Promise<Response | null> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }
  return null;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user.role === 'ADMIN';
}
