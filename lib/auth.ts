import { betterAuth } from 'better-auth';
import { memoryAdapter, type MemoryDB } from 'better-auth/adapters/memory';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins/admin';
import { db } from '@/lib/db';
import { USE_DB } from '@/lib/data/source';

/**
 * Better Auth — Google OAuth + plugin admin().
 *
 * Có DATABASE_URL → prismaAdapter: người dùng và phiên nằm trong Postgres,
 * dùng chung bốn model User/Session/Account/Verification trong
 * prisma/schema.prisma. Đây là cấu hình production.
 *
 * Không có → memoryAdapter: phiên nằm trong tiến trình Node, mất khi restart.
 * Chỉ để dev trên mock. Vercel chạy nhiều instance nên KHÔNG dùng được ở đó.
 *
 * Khi nâng Better Auth, chạy lại `npx @better-auth/cli generate` (cần
 * DATABASE_URL đặt tạm, ví dụ DATABASE_URL=postgres://x) và đối chiếu với
 * schema — cấu trúc bảng của nó đổi giữa các phiên bản.
 */

// globalThis để phiên đăng nhập sống sót qua hot-reload của Next dev.
declare global {
  var __bjtAuthDb: MemoryDB | undefined;
}
const memoryDb: MemoryDB = globalThis.__bjtAuthDb ?? {
  user: [],
  session: [],
  account: [],
  verification: [],
};
if (process.env.NODE_ENV !== 'production') globalThis.__bjtAuthDb = memoryDb;

/**
 * Email được gán ADMIN lúc tài khoản được TẠO. Chỉ để bootstrap admin đầu
 * tiên trên một database mới; sau đó đổi vai trò ở /admin/users. Hook chỉ
 * chạy khi tạo user nên không đụng tài khoản đã có.
 */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/** Google OAuth đã cấu hình chưa — dùng để hiện thông báo rõ ràng thay vì lỗi khó hiểu. */
export const isGoogleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

export const auth = betterAuth({
  appName: 'BJT Prep',
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  // Chỉ chấp nhận request từ chính domain của app (và NEXT_PUBLIC_APP_URL nếu khác).
  trustedOrigins: [...new Set([baseURL, process.env.NEXT_PUBLIC_APP_URL].filter((x): x is string => Boolean(x)))],

  database: USE_DB ? prismaAdapter(db, { provider: 'postgresql' }) : memoryAdapter(memoryDb),

  // Chỉ đăng ký provider khi đã có credentials. Đăng ký với chuỗi rỗng thì
  // Better Auth trả 500 với body rỗng và người dùng chỉ thấy spinner quay mãi.
  socialProviders: isGoogleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},

  user: {
    additionalFields: {
      // Trường riêng của dự án, khớp với cột `locale` trong prisma/schema.prisma.
      locale: { type: 'string', defaultValue: 'vi', input: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        // Bootstrap admin đầu tiên theo ADMIN_EMAILS. Không có trong danh sách
        // thì để plugin admin() gán vai trò mặc định (USER).
        before: async (user) => {
          if (!isAdminEmail(user.email)) return { data: user };
          return { data: { ...user, role: 'ADMIN' } };
        },
      },
    },
  },

  plugins: [
    admin({
      defaultRole: 'USER',
      // Khớp enum UserRole trong schema: USER | EDITOR | ADMIN.
      adminRoles: ['ADMIN'],
      bannedUserMessage: 'Tài khoản của bạn đã bị khoá. Liên hệ quản trị viên để biết thêm.',
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
