import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 bỏ key "prisma" trong package.json — mọi cấu hình chuyển về đây.
// File này KHÔNG cần DATABASE_URL để chạy `prisma generate`; chỉ migrate/seed/studio mới cần.
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),

  // Đọc trực tiếp process.env chứ KHÔNG dùng helper env() của Prisma: env() đọc eager
  // và sẽ ném lỗi ngay cả với `prisma generate` khi chưa có DATABASE_URL.
  // Chuỗi rỗng là hợp lệ cho generate; migrate/seed/studio sẽ tự báo lỗi rõ nếu thiếu.
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },

  migrations: {
    path: path.join('prisma', 'migrations'),
    // Prisma 7 bỏ tự động seed — phải gọi tay: npm run db:seed
    seed: 'tsx prisma/seed.ts',
  },
});
