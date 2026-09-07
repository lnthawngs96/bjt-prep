import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// Prisma 7 BẮT BUỘC driver adapter — không còn engine Rust mặc định.
// Neon serverless driver hợp với Vercel: không cạn connection pool khi scale.

declare global {
  // Giữ một instance duy nhất qua hot-reload của Next dev.
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'Thiếu DATABASE_URL. Giai đoạn giao diện chưa cần database — ' +
        'nếu bạn thấy lỗi này nghĩa là có code đang gọi Prisma quá sớm. ' +
        'Tầng dữ liệu phải đi qua lib/data/, hiện đọc từ lib/data/sources/mock/. ' +
        'Khi sẵn sàng bật DB thật, làm theo docs/db-setup.md.',
    );
  }
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });
}

export const db: PrismaClient = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalThis.__prisma = db;
