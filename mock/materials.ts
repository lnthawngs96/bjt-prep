import type { Material, MediaAsset } from '@/lib/prisma-types';
import { ContentStatus, MaterialKind } from '@/lib/prisma-types';
import { stamps, T0 } from './_shared';

/* ============================================================
   MEDIA — giai đoạn tĩnh trỏ vào public/mock-audio và public/mock-image.
   r2Key giữ đúng dạng đường dẫn thật để Phase 4 không phải đổi hình dạng dữ liệu.
   ============================================================ */

export const MOCK_MEDIA: MediaAsset[] = [
  {
    id: 'med-lr2-007',
    r2Key: 'bjt/audio/lr2-007.mp3',
    mime: 'audio/mpeg',
    bytes: 486_320,
    durationMs: 61_000,
    checksum: null,
    // Peak tính sẵn lúc upload để vẽ sóng mà không phải tải cả file audio.
    waveform: [
      40, 72, 55, 88, 34, 61, 78, 45, 66, 29, 81, 52, 38, 70, 47, 59, 33, 75, 41, 64,
      57, 83, 36, 68, 49, 77, 31, 62, 54, 86, 43, 71, 58, 35, 79, 46, 67, 39, 73, 51,
    ],
    uploadedBy: null,
    createdAt: T0,
  },
  {
    id: 'med-l2-014',
    r2Key: 'bjt/audio/l2-014.mp3',
    mime: 'audio/mpeg',
    bytes: 118_940,
    durationMs: 14_000,
    checksum: null,
    waveform: [35, 68, 82, 47, 59, 74, 41, 63, 88, 52, 36, 71, 45, 66, 30, 78, 54, 42, 69, 57],
    uploadedBy: null,
    createdAt: T0,
  },
  {
    id: 'med-img-l2-014',
    r2Key: 'bjt/image/l2-014.svg',
    mime: 'image/svg+xml',
    bytes: 4_180,
    durationMs: null,
    checksum: null,
    waveform: null,
    uploadedBy: null,
    createdAt: T0,
  },
  {
    id: 'med-lr2-008',
    r2Key: 'bjt/audio/lr2-008.mp3',
    mime: 'audio/mpeg',
    bytes: 312_450,
    durationMs: 39_000,
    checksum: null,
    waveform: [42, 66, 79, 38, 71, 55, 84, 47, 62, 33, 76, 58, 44, 69, 51, 87, 36, 73, 60, 49,
               65, 41, 80, 53, 37, 74, 46, 68, 57, 82, 39, 63, 50, 77, 43, 70, 56, 35, 72, 48],
    uploadedBy: null,
    createdAt: T0,
  },
  {
    id: 'med-lr2-009',
    r2Key: 'bjt/audio/lr2-009.mp3',
    mime: 'audio/mpeg',
    bytes: 368_100,
    durationMs: 46_000,
    checksum: null,
    waveform: [37, 70, 52, 85, 44, 61, 76, 40, 67, 32, 79, 54, 46, 73, 58, 35, 81, 49, 64, 42,
               75, 57, 38, 69, 50, 83, 45, 62, 71, 34, 78, 53, 47, 66, 59, 41, 74, 51, 68, 36],
    uploadedBy: null,
    createdAt: T0,
  },
];

export const MOCK_MEDIA_BY_ID = new Map(MOCK_MEDIA.map((m) => [m.id, m]));

/**
 * Giai đoạn tĩnh: đường dẫn cục bộ trong public/.
 * TODO(r2): Phase 4 thay bằng presigned URL hết hạn 10 phút, gắn với attempt đang mở.
 */
export const MOCK_MEDIA_URL: Record<string, string> = {
  'med-lr2-007': '/mock-audio/lr2-007.mp3',
  'med-l2-014': '/mock-audio/l2-014.mp3',
  'med-img-l2-014': '/mock-image/l2-014.svg',
  'med-lr2-008': '/mock-audio/lr2-008.mp3',
  'med-lr2-009': '/mock-audio/lr2-009.mp3',
};

/* ============================================================
   MATERIAL — vật liệu đề bài
   ============================================================ */

export const MOCK_MATERIALS: Material[] = [
  // ---- AUDIO cho group LR2 (資料聴読解) ----
  {
    id: 'mat-lr2-007-audio',
    kind: MaterialKind.AUDIO,
    titleAdmin: '営業部 第3四半期 売上報告 — hội thoại',
    mediaId: 'med-lr2-007',
    // startMs/endMs từng lượt nói: màn xem lại đánh dấu được đúng câu học viên nghe sót.
    transcript: [
      { speaker: '課長', role: 'boss', text: '皆さん、第3四半期の結果が出ましたので確認しましょう。', startMs: 0, endMs: 5200 },
      { speaker: '田中', role: 'staff', text: '関東は目標4,200に対して4,680、達成率111%でした。', startMs: 5200, endMs: 12000 },
      { speaker: '課長', role: 'boss', text: '田中さん、よくやってくれました。九州と東北も順調ですね。', startMs: 12000, endMs: 18400 },
      { speaker: '佐藤', role: 'staff', text: '申し訳ございません。関西は3,120で、82%にとどまりました。', startMs: 18400, endMs: 25600 },
      { speaker: '課長', role: 'boss', text: '佐藤さん、原因の分析はできていますか。', startMs: 25600, endMs: 30200 },
      { speaker: '佐藤', role: 'staff', text: '大口の取引先が一社、発注を来期に回したことが大きいです。', startMs: 30200, endMs: 37000 },
      { speaker: '課長', role: 'boss', text: 'なるほど。では佐藤さんに来週の会議までに改善案をまとめてもらいましょう。', startMs: 37000, endMs: 45800 },
      { speaker: '佐藤', role: 'staff', text: 'かしこまりました。来週月曜までに提出いたします。', startMs: 45800, endMs: 51400 },
      { speaker: '課長', role: 'boss', text: '東北の高橋さんの数字は全社に共有したいので、資料をお願いします。', startMs: 51400, endMs: 59000 },
    ],
    body: null,
    altText: null,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },

  // ---- TABLE cho group LR2 — khớp đúng docs/prototype.html ----
  {
    id: 'mat-lr2-007-table',
    kind: MaterialKind.TABLE,
    titleAdmin: '営業部 第3四半期 売上報告 — bảng số liệu',
    mediaId: null,
    transcript: null,
    body: {
      caption: '営業部 第3四半期 売上報告',
      headers: ['担当', '地域', '目標', '実績', '達成率'],
      rows: [
        ['田中', '関東', '4,200', '4,680', '111%'],
        ['佐藤', '関西', '3,800', '3,120', '82%'],
        ['鈴木', '九州', '2,500', '2,540', '102%'],
        ['高橋', '東北', '1,900', '2,310', '122%'],
      ],
      // Cột số căn phải.
      numericColumns: [2, 3, 4],
    },
    altText: 'Bảng doanh số quý 3 của phòng kinh doanh theo bốn khu vực, có cột mục tiêu, thực tế và tỉ lệ đạt.',
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },

  // ---- IMAGE cho group L2 (発言聴解 — sample chính thức có ảnh) ----
  {
    id: 'mat-l2-014-image',
    kind: MaterialKind.IMAGE,
    titleAdmin: '受付で来客を迎える場面',
    mediaId: 'med-img-l2-014',
    transcript: null,
    body: null,
    altText: 'Nhân viên lễ tân đứng sau quầy, một khách hàng vừa bước vào sảnh công ty và đang đưa danh thiếp.',
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },

  // ---- AUDIO cho group L2 ----
  {
    id: 'mat-l2-014-audio',
    kind: MaterialKind.AUDIO,
    titleAdmin: '受付での発言 — audio',
    mediaId: 'med-l2-014',
    transcript: [
      { speaker: '来客', role: 'client', text: '恐れ入ります。営業部の山田様と2時にお約束をしております、丸紅商事の小林と申します。', startMs: 0, endMs: 11000 },
    ],
    body: null,
    altText: null,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },

  // ---- DOCUMENT cho group R2 (表現読解) ----
  {
    id: 'mat-r2-021-doc',
    kind: MaterialKind.DOCUMENT,
    titleAdmin: '納期変更のお詫びメール',
    mediaId: null,
    transcript: null,
    body: {
      format: 'html',
      content: [
        '<p>株式会社アオバ<br>購買部 佐々木様</p>',
        '<p>いつも大変お世話になっております。<br>ミドリ工業の中村でございます。</p>',
        '<p>先日ご注文いただきました部品AX-200につきまして、',
        '製造ラインの不具合により、当初お約束した10月5日の納品が',
        '難しい状況となりました。</p>',
        '<p>現時点では10月12日の納品を見込んでおります。',
        'ご迷惑をおかけし、誠に申し訳ございません。</p>',
        '<p>つきましては、代替案として一部を先行してお届けすることも',
        '可能でございます。ご都合はいかがでしょうか。</p>',
        '<p>何卒よろしくお願い申し上げます。</p>',
      ].join('\n'),
    },
    altText: null,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },

  // ---- CHART cho group LR2-008 ----
  {
    id: 'mat-lr2-008-chart',
    kind: MaterialKind.CHART,
    titleAdmin: '運営コスト推移 — biểu đồ cột',
    mediaId: null,
    transcript: null,
    body: {
      chartType: 'bar',
      caption: '部門別 運営コスト（単位：万円）',
      axisLabels: { x: '四半期', y: '万円' },
      categories: ['第1四半期', '第2四半期', '第3四半期', '第4四半期'],
      series: [
        { name: '人件費', values: [1820, 1850, 1910, 1880] },
        { name: '外注費', values: [640, 720, 980, 1140] },
        { name: '広告費', values: [430, 380, 350, 300] },
      ],
    },
    altText:
      'Biểu đồ cột chi phí vận hành bốn quý: chi phí nhân sự gần như đi ngang, chi phí thuê ngoài tăng mạnh từ quý 3, chi phí quảng cáo giảm dần.',
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'mat-lr2-008-audio',
    kind: MaterialKind.AUDIO,
    titleAdmin: '運営コスト推移 — hội thoại',
    mediaId: 'med-lr2-008',
    transcript: [
      { speaker: '部長', role: 'boss', text: 'このグラフを見て、気になる点はありますか。', startMs: 0, endMs: 4600 },
      { speaker: '中村', role: 'staff', text: '外注費が第2四半期から急に伸びていますね。', startMs: 4600, endMs: 10200 },
      { speaker: '部長', role: 'boss', text: 'そうです。人手が足りず、開発の一部を外に出したためです。', startMs: 10200, endMs: 17400 },
      { speaker: '中村', role: 'staff', text: '広告費は逆に下がり続けていますが、これは意図的でしょうか。', startMs: 17400, endMs: 24000 },
      { speaker: '部長', role: 'boss', text: 'はい、来期は広告を絞って、その分を採用に回す方針です。', startMs: 24000, endMs: 31200 },
      { speaker: '部長', role: 'boss', text: '中村さん、外注費の内訳を明日までに整理しておいてください。', startMs: 31200, endMs: 38600 },
    ],
    body: null,
    altText: null,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },

  // ---- TABLE lịch họp cho group LR2-009 ----
  {
    id: 'mat-lr2-009-table',
    kind: MaterialKind.TABLE,
    titleAdmin: '来週の会議スケジュール',
    mediaId: null,
    transcript: null,
    body: {
      caption: '来週の会議スケジュール（第2会議室）',
      headers: ['曜日', '時間', '会議名', '主催部署'],
      rows: [
        ['月', '10:00〜11:30', '定例部会', '営業部'],
        ['火', '14:00〜15:00', '新製品説明会', '開発部'],
        ['水', '09:30〜12:00', '四半期予算会議', '経理部'],
        ['木', '16:00〜17:00', '採用面接', '人事部'],
        ['金', '13:00〜14:30', '取引先訪問報告', '営業部'],
      ],
      numericColumns: [],
    },
    altText: 'Bảng lịch họp phòng họp số 2 trong tuần, gồm thứ, giờ, tên cuộc họp và phòng ban chủ trì.',
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'mat-lr2-009-audio',
    kind: MaterialKind.AUDIO,
    titleAdmin: '会議日程の調整 — hội thoại',
    mediaId: 'med-lr2-009',
    transcript: [
      { speaker: '鈴木', role: 'staff', text: '課長、取引先との打ち合わせを来週入れたいのですが。', startMs: 0, endMs: 6000 },
      { speaker: '課長', role: 'boss', text: '第2会議室は結構埋まっていますね。何時間必要ですか。', startMs: 6000, endMs: 12800 },
      { speaker: '鈴木', role: 'staff', text: '2時間ほどです。午後がありがたいです。', startMs: 12800, endMs: 18000 },
      { speaker: '課長', role: 'boss', text: '水曜の午後なら空いていますが、その日は私が予算会議で終日出られません。', startMs: 18000, endMs: 26400 },
      { speaker: '鈴木', role: 'staff', text: 'では、木曜の午後はいかがでしょうか。', startMs: 26400, endMs: 31000 },
      { speaker: '課長', role: 'boss', text: '木曜は16時から面接が入っています。それより前なら大丈夫です。', startMs: 31000, endMs: 38800 },
      { speaker: '鈴木', role: 'staff', text: 'かしこまりました。木曜の14時から16時で先方に打診いたします。', startMs: 38800, endMs: 46200 },
    ],
    body: null,
    altText: null,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
];

export const MOCK_MATERIAL_BY_ID = new Map(MOCK_MATERIALS.map((m) => [m.id, m]));
