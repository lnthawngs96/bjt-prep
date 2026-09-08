import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

/**
 * Prisma 7 BẮT BUỘC driver adapter — không còn engine Rust mặc định.
 * Neon serverless driver hợp với Vercel: không cạn connection pool khi scale.
 *
 * Client khởi tạo LƯỜI: chỉ tạo khi có truy vấn đầu tiên. Nhờ vậy app vẫn
 * import được `db` khi chưa đặt DATABASE_URL (dev trên mock, chạy test) —
 * tầng dữ liệu chọn nguồn theo USE_DB trong lib/data/source.ts.
 */

declare global {
  // Giữ một instance duy nhất qua hot-reload của Next dev.
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'Thiếu DATABASE_URL. Nếu bạn thấy lỗi này nghĩa là có code đang gọi Prisma ' +
        'trong khi chưa bật database. Tầng dữ liệu phải đi qua lib/data/, nguồn ' +
        'được chọn theo DATABASE_URL. Bật DB thật theo docs/setup.md.',
    );
  }
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });
}

export function getDb(): PrismaClient {
  if (!globalThis.__prisma) {
    const client = createClient();
    if (process.env.NODE_ENV === 'production') return client;
    globalThis.__prisma = client;
  }
  return globalThis.__prisma;
}

/**
 * Cùng ergonomics `db.user.findMany(...)` nhưng chỉ khởi tạo khi chạm tới.
 * Proxy chuyển mọi truy cập thuộc tính sang client thật.
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb();
    const value = Reflect.get(client, prop);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
