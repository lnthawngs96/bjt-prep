import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * Chắn điều hướng vào /admin/* khi chưa đăng nhập.
 *
 * Ở đây CHỈ kiểm sự tồn tại của cookie phiên, không kiểm vai trò: middleware
 * chạy trên Edge và không nên gọi database hay giải mã phiên ở mỗi request.
 * Việc kiểm vai trò thật nằm ở layout của /admin và ở requireAdmin() trong
 * từng Route Handler.
 *
 * MIDDLEWARE MỘT MÌNH KHÔNG ĐỦ. Nó chỉ chắn điều hướng trang; ai gọi thẳng
 * vào API vẫn lọt nếu handler không tự kiểm.
 */
export function middleware(req: NextRequest) {
  const hasSession = getSessionCookie(req);
  if (hasSession) return NextResponse.next();

  const login = new URL('/login', req.url);
  login.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/admin/:path*'],
};
