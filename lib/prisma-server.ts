// CHỈ SERVER. Namespace giá trị của Prisma: DbNull, lỗi P2002, v.v.
//
// Tách khỏi lib/prisma-types.ts vì file kia được cả client component import
// (enum, type); kéo `Prisma` từ client generated vào đó là bundle trình duyệt
// bị lôi cả runtime Prisma (node:module) và Turbopack gãy.
//
// Đây là chỗ THỨ HAI (và cuối cùng) chạm đường dẫn client generated — cùng
// với lib/prisma-types.ts. Đổi `output` trong schema thì sửa hai file này.
export { Prisma } from '@/app/generated/prisma/client';
