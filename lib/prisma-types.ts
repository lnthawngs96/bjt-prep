// Chỗ DUY NHẤT trong dự án chạm vào đường dẫn client do Prisma sinh ra.
// Nếu đổi `output` trong prisma/schema.prisma thì chỉ sửa file này.
//
// Mọi nơi khác import như sau:
//   import type { Question, SectionCode, Level } from '@/lib/prisma-types';
//   import { Prisma } from '@/lib/prisma-types';   // namespace giá trị: DbNull, lỗi P2002, TransactionClient
//
// KHÔNG viết tay type song song với schema — sẽ lệch và phải sửa hai nơi.
export type * from '@/app/generated/prisma/client';
export { Prisma } from '@/app/generated/prisma/client';
export * from '@/app/generated/prisma/enums';
