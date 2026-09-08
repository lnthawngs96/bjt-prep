import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 bỏ key "prisma" trong package.json — mọi cấu hình chuyển về đây.
// File này KHÔNG cần DATABASE_URL để chạy `prisma generate`; chỉ migrate/seed/studio mới cần.
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),

  // Migrate cần kết nối TRỰC TIẾP (unpooled) — qua pooler của Neon có thể hỏng
  // vì PgBouncer không giữ được advisory lock. Runtime (lib/db.ts) vẫn dùng
  // chuỗi pooled trong DATABASE_URL.
  //
  // Đọc trực tiếp process.env chứ KHÔNG dùng helper env() của Prisma: env() đọc eager
  // và sẽ ném lỗi ngay cả với `prisma generate` khi chưa có DATABASE_URL.
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '',
  },

  migrations: {
    path: path.join('prisma', 'migrations'),
    // Prisma 7 bỏ tự động seed — phải gọi tay: npm run db:seed, rồi npm run db:seed:content
    seed: 'tsx prisma/seed.ts',
  },
});
