import type { ContentSource } from '@/types/common/contentSource';

/**
 * Sổ đăng ký sách tham khảo. Mọi số ISBN và năm phát hành tra từ trang nhà xuất
 * bản hoặc nhà sách, không lấy từ trí nhớ — chi tiết và ghi chú bản quyền ở
 * docs/sources.md.
 *
 * `sourceKey` trong DB là String? nên khoá lạ vẫn lưu được; chỗ hiển thị tự lùi
 * về in nguyên khoá. Thêm sách mới thì thêm vào đây, không cần migration.
 */
export const CONTENT_SOURCES = {
  'bjt-official-mock-2017': {
    titleJa: 'BJTビジネス日本語能力テスト 公式 模擬テスト＆ガイド',
    shortTitleJa: '公式 模擬テスト＆ガイド',
    authors: null,
    publisher: '日本漢字能力検定協会',
    year: 2017,
    isbn: '978-4-89096-369-0',
    url: 'https://store.kanken.or.jp/products/978-4-89096-369-0',
    isOfficial: true,
    isFree: false,
    noteVi: 'Sách chính thống duy nhất bám đúng định dạng CBT hiện hành. Dùng để đối chiếu văn phong đề bài và độ khó từng section.',
  },
  'bjt-official-guide-2009': {
    titleJa: 'BJTビジネス日本語能力テスト 公式ガイド 改訂版',
    shortTitleJa: '公式ガイド 改訂版',
    authors: '加藤清方',
    publisher: '日本漢字能力検定協会',
    year: 2009,
    isbn: '978-4-89096-185-6',
    url: null,
    isOfficial: true,
    isFree: false,
    noteVi: 'Thời kỳ đề giấy — cấu trúc đề đã lỗi thời. Chỉ còn giá trị ở phần khái niệm năng lực giao tiếp và cách phân bậc J5–J1+.',
  },
  'kaisha-no-nihongo-2023': {
    titleJa: 'それ、知りたかった！カイシャの日本語 〜マンガで学ぶ ビジネススキル＆ボキャブラリー〜',
    shortTitleJa: 'カイシャの日本語',
    authors: '池田佳子 · 古川智樹',
    publisher: '日本漢字能力検定協会',
    year: 2023,
    isbn: '978-4-89096-485-7',
    url: 'https://store.kanken.or.jp/products/978-4-89096-485-7',
    isOfficial: true,
    isFree: false,
    noteVi: 'Có 難易度別語彙表 — bảng từ vựng công sở phân theo độ khó. Gần nhất với một danh sách từ vựng tham chiếu cho BJT.',
  },
  'jitsuryoku-choukai-2018': {
    titleJa: 'BJTビジネス日本語能力テスト 聴解・聴読解 実力養成問題集 第2版',
    shortTitleJa: '実力養成問題集 聴解・聴読解',
    authors: '宮崎道子 · 瀬川由美 · 北村貞幸 · 植松真由美',
    publisher: 'スリーエーネットワーク',
    year: 2018,
    isbn: '978-4-88319-768-2',
    url: 'https://www.3anet.co.jp/np/books/4971/',
    isOfficial: false,
    isFree: false,
    noteVi: 'Có 別冊「必携・重要ビジネス用語表現集」 — nguồn từ vựng sát đề nhất cho phần 聴解 và 聴読解.',
  },
  'jitsuryoku-dokkai-2018': {
    titleJa: 'BJTビジネス日本語能力テスト 読解 実力養成問題集 第2版',
    shortTitleJa: '実力養成問題集 読解',
    authors: '宮崎道子 · 瀬川由美',
    publisher: 'スリーエーネットワーク',
    year: 2018,
    isbn: '978-4-88319-769-9',
    url: 'https://www.3anet.co.jp/np/books/4973/',
    isOfficial: false,
    isFree: false,
    noteVi: 'Bao đúng ba section R1 語彙・文法 · R2 表現読解 · R3 総合読解 — nguồn ngữ pháp sát đề nhất.',
  },
  'moshi-to-taisaku-2026': {
    titleJa: '［音声DL版］BJTビジネス日本語能力テスト 模試と対策',
    shortTitleJa: '模試と対策',
    authors: '株式会社パソナHRソリューション',
    publisher: 'アスク出版',
    year: 2026,
    isbn: '978-4-86639-918-8',
    url: 'https://ask-books.com/book-details/?slug=9784866399188',
    isOfficial: false,
    isFree: false,
    noteVi: 'Giải thích từng dạng câu hỏi và cách xử lý. Hữu ích khi viết explanationVi — cách nói "vì sao phương án này sai".',
  },
  'keigo-shishin-2007': {
    titleJa: '敬語の指針（文化審議会答申）',
    shortTitleJa: '敬語の指針',
    authors: '文化審議会',
    publisher: '文化庁',
    year: 2007,
    isbn: null,
    url: 'https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf',
    isOfficial: false,
    isFree: true,
    noteVi: 'Văn bản chuẩn nhà nước về kính ngữ, công bố miễn phí. Chia kính ngữ thành 5 loại — căn cứ để tách 謙譲語Ⅰ (拝見する) khỏi 謙譲語Ⅱ (参る · 申す).',
  },
  'bunkei-jiten-2023': {
    titleJa: '日本語文型辞典 改訂版',
    shortTitleJa: '日本語文型辞典',
    authors: 'グループ・ジャマシイ',
    publisher: 'くろしお出版',
    year: 2023,
    isbn: '978-4-87424-949-9',
    url: null,
    isOfficial: false,
    isFree: false,
    noteVi: 'Từ điển mẫu câu kinh điển, có bản dịch tiếng Việt — tiện đối chiếu khi viết meaningVi cho mẫu ngữ pháp.',
  },
  'donna-toki-2010': {
    titleJa: '新装版 どんなときどう使う 日本語表現文型辞典',
    shortTitleJa: '日本語表現文型辞典',
    authors: '友松悦子 và cộng sự',
    publisher: 'アルク',
    year: 2010,
    isbn: '978-4-7574-1886-8',
    url: null,
    isOfficial: false,
    isFree: false,
    noteVi: 'Có chỉ mục theo chức năng (54 nhóm) — hợp để đối chiếu Tag thuộc nhóm function.',
  },
  'task-mail-2014': {
    titleJa: 'タスクで学ぶ日本語 ビジネスメール・ビジネス文書',
    shortTitleJa: 'ビジネスメール・ビジネス文書',
    authors: '村野節子 · 向山陽子 · 山辺真理子',
    publisher: 'スリーエーネットワーク',
    year: 2014,
    isbn: '978-4-88319-699-9',
    url: 'https://www.3anet.co.jp/np/books/4020/',
    isOfficial: false,
    isFree: false,
    noteVi: 'Nguồn cho Register.WRITTEN: 〜につきましては · 〜ようお願いいたします · bố cục 拝啓/敬具 và 記/以上.',
  },
} as const satisfies Record<string, ContentSource>;

export type ContentSourceKey = keyof typeof CONTENT_SOURCES;

export const CONTENT_SOURCE_KEYS = Object.keys(CONTENT_SOURCES) as ContentSourceKey[];

/** Nhãn cho select ở trang admin. */
export const CONTENT_SOURCE_LABELS = Object.fromEntries(
  CONTENT_SOURCE_KEYS.map((k) => [k, `${CONTENT_SOURCES[k].shortTitleJa} (${CONTENT_SOURCES[k].year})`]),
) as Record<ContentSourceKey, string>;

/** Khoá lạ (nhập tay, sách chưa đăng ký) trả null — chỗ gọi tự lùi về in nguyên khoá. */
export function getContentSource(key: string | null | undefined): ContentSource | null {
  if (!key) return null;
  return CONTENT_SOURCES[key as ContentSourceKey] ?? null;
}
