/**
 * Công tắc nguồn dữ liệu của cả app.
 *
 * Có DATABASE_URL → lib/data/* đọc từ sources/db (Prisma + Neon).
 * Không có     → đọc từ sources/mock (dev không cần DB, và Vitest).
 *
 * Production trên Vercel luôn có DATABASE_URL. Mỗi barrel trong lib/data/
 * ép `typeof mock` lên nguồn db, nên hai nguồn không thể lệch chữ ký.
 */
export const USE_DB = Boolean(process.env.DATABASE_URL);
