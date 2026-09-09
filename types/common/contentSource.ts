/**
 * Sách/tài liệu dùng làm căn cứ khi soạn nội dung — xem docs/sources.md.
 *
 * Dữ liệu chỉ giữ KHOÁ (`sourceKey`) và vị trí trong sách (`sourceLocator`).
 * Toàn bộ thông tin thư mục nằm ở constants/common/contentSources.ts, đổi cách
 * hiển thị hay sửa ISBN chỉ phải sửa một chỗ.
 */
export type ContentSource = {
  /** Tên đầy đủ tiếng Nhật. */
  titleJa: string;
  /** Tên rút gọn cho dòng "Tham khảo" — tên đầy đủ dài quá một dòng. */
  shortTitleJa: string;
  authors: string | null;
  publisher: string;
  /** Năm phát hành của đúng bản đang tham chiếu. */
  year: number;
  isbn: string | null;
  /** Trang chính thức, nếu có bản công khai. */
  url: string | null;
  /** Do chính đơn vị tổ chức BJT (日本漢字能力検定協会) phát hành. */
  isOfficial: boolean;
  /** Công bố miễn phí — trích dẫn không vướng bản quyền. */
  isFree: boolean;
  /** Vì sao cuốn này nằm trong danh sách, và dùng nó cho phần nào. */
  noteVi: string;
};
