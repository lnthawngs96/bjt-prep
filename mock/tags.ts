import type { Tag } from '@/lib/prisma-types';

/**
 * Nhãn kỹ năng — nguồn của khối "Đang yếu nhất".
 * Giữ ĐỒNG BỘ với prisma/seed.ts.
 *
 * Không có bảng này thì chỉ nói được "bạn yếu phần 聴読解" — quá chung để hành động.
 * Có nó thì nói được "bạn sai 62% các câu về chỉ thị gián tiếp của cấp trên".
 */

const raw: [slug: string, nameVi: string, nameJa: string, category: string][] = [
  // function — chức năng ngôn ngữ
  ['keigo-phone', 'Kính ngữ trong hội thoại điện thoại', '電話の敬語', 'function'],
  ['keigo-facetoface', 'Kính ngữ khi gặp mặt', '対面の敬語', 'function'],
  ['indirect-order', 'Chỉ thị gián tiếp của cấp trên', '間接的な指示', 'function'],
  ['polite-refusal', 'Từ chối lịch sự', '丁寧な断り', 'function'],
  ['apology-customer', 'Xin lỗi khách hàng', '謝罪', 'function'],
  ['request-permission', 'Đề nghị và xin phép', '依頼・許可', 'function'],
  ['progress-report', 'Báo cáo tiến độ', '進捗報告', 'function'],
  ['confirm-info', 'Xác nhận lại thông tin', '確認', 'function'],

  // document — loại tài liệu
  ['doc-email-internal', 'Email nội bộ', '社内メール', 'document'],
  ['doc-email-client', 'Email khách hàng', '社外メール', 'document'],
  ['doc-notice', 'Thông báo', '通知', 'document'],
  ['doc-minutes', 'Biên bản họp', '議事録', 'document'],
  ['doc-ringi', 'Đơn xin phê duyệt', '稟議書', 'document'],
  ['doc-schedule', 'Lịch trình', 'スケジュール', 'document'],
  ['chart-bar', 'Biểu đồ cột', '棒グラフ', 'document'],
  ['chart-line', 'Biểu đồ đường', '折れ線グラフ', 'document'],
  ['table-numbers', 'Bảng số liệu', '数値表', 'document'],

  // scenario — bối cảnh
  ['sc-meeting', 'Họp', '会議', 'scenario'],
  ['sc-phone', 'Điện thoại', '電話', 'scenario'],
  ['sc-visitor', 'Tiếp khách', '来客対応', 'scenario'],
  ['sc-meishi', 'Trao đổi danh thiếp', '名刺交換', 'scenario'],
  ['sc-report-boss', 'Báo cáo cấp trên', '上司へ報告', 'scenario'],
  ['sc-colleague', 'Trao đổi với đồng nghiệp', '同僚との会話', 'scenario'],
];

export const MOCK_TAGS: Tag[] = raw.map(([slug, nameVi, nameJa, category], i) => ({
  id: `tag-${slug}`,
  slug,
  nameVi,
  nameJa,
  category,
  order: i,
}));

export const MOCK_TAG_BY_SLUG = new Map(MOCK_TAGS.map((t) => [t.slug, t]));
