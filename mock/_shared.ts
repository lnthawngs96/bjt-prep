/**
 * Mốc thời gian cố định cho toàn bộ mock.
 *
 * KHÔNG dùng new Date() — giá trị đổi mỗi lần render sẽ làm server và client
 * ra HTML khác nhau và React báo lệch hydration.
 */
export const T0 = new Date('2026-08-01T09:00:00+07:00');
export const T1 = new Date('2026-09-01T09:00:00+07:00');

/** Ngày "hôm nay" của học viên mẫu — mọi tính toán tương đối bám vào đây. */
export const TODAY = new Date('2026-09-07T09:00:00+07:00');

export const stamps = { createdAt: T0, updatedAt: T1 };
