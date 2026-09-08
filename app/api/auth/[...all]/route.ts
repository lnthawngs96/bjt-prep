import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

/**
 * Mọi endpoint của Better Auth: đăng nhập, callback OAuth, phiên, đăng xuất.
 * Đường dẫn là [...all] chứ KHÔNG phải [...nextauth] — đây là Better Auth,
 * không phải NextAuth.
 */
export const { GET, POST } = toNextJsHandler(auth);
