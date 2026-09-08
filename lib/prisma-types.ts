// Chạm vào đường dẫn client do Prisma sinh ra — cùng với lib/prisma-server.ts.
// Nếu đổi `output` trong prisma/schema.prisma thì chỉ sửa hai file đó.
//
// File này AN TOÀN cho client component: chỉ có type (bị xoá lúc biên dịch) và
// enum (object thuần từ enums.ts, không kéo runtime). Namespace giá trị
// `Prisma` (DbNull, lỗi P2002…) nằm ở lib/prisma-server.ts, chỉ server import.
//
// Mọi nơi khác import như sau:
//   import type { Question, SectionCode, Level } from '@/lib/prisma-types';
//   import { ContentStatus } from '@/lib/prisma-types';           // enum giá trị
//   import type { Prisma } from '@/lib/prisma-types';             // Prisma.TransactionClient, Prisma.InputJsonValue
//   import { Prisma } from '@/lib/prisma-server';                 // Prisma.DbNull, PrismaClientKnownRequestError — server
//
// KHÔNG viết tay type song song với schema — sẽ lệch và phải sửa hai nơi.
export type * from '@/app/generated/prisma/client';
export * from '@/app/generated/prisma/enums';
