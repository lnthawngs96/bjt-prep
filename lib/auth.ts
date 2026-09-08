import { betterAuth } from 'better-auth';
import { memoryAdapter, type MemoryDB } from 'better-auth/adapters/memory';
import { admin } from 'better-auth/plugins/admin';

/**
 * Better Auth — Google OAuth + plugin admin().
 *
 * GIAI ĐOẠN NÀY CHƯA CÓ DATABASE nên dùng memoryAdapter. Người dùng và phiên
 * nằm trong tiến trình Node và mất khi restart dev server. Đó là điều bình
 * thường ở giai đoạn dựng giao diện, KHÔNG được mang lên production.
 *
 * TODO(db): Phase 4 thay memoryAdapter bằng prismaAdapter(db, { provider: 'postgresql' }).
 *   Trước khi migrate PHẢI chạy `npx @better-auth/cli generate` và đối chiếu với
 *   bốn model User/Session/Account/Verification trong prisma/schema.prisma —
 *   schema của Better Auth đổi giữa các phiên bản, đừng tin bản trong repo là mới nhất.
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
 * Danh sách email được coi là admin ở giai đoạn tĩnh.
 *
 * TODO(db): Phase 4 bỏ hẳn biến này. Vai trò đọc từ cột `role` của bảng user
 * do plugin admin() quản lý, đổi qua trang /admin/users.
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

export const auth = betterAuth({
  appName: 'BJT Prep',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,

  database: memoryAdapter(memoryDb),

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
        // Gán vai trò lúc tạo tài khoản dựa trên ADMIN_EMAILS.
        // TODO(db): Phase 4 bỏ hook này, đổi vai trò qua trang /admin/users.
        before: async (user) => ({
          data: { ...user, role: isAdminEmail(user.email) ? 'ADMIN' : 'USER' },
        }),
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
