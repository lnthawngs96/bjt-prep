# Nguồn nội dung — sách chính thống cho từ vựng và ngữ pháp BJT

Ghi ngày **09/09/2026**. Mọi số ISBN, năm phát hành và tên tác giả dưới đây đều tra
từ trang nhà xuất bản hoặc nhà sách, không lấy từ trí nhớ. Chỗ nào chưa xác minh
được thì ghi rõ *(chưa xác minh)*.

Mục đích: chọn ra tập sách làm **chuẩn tham chiếu** khi viết từ vựng và ngữ pháp cho
app, và ghi lại nguồn ngay trong dữ liệu để mỗi mục đều truy được về đâu.

---

## 1. Bối cảnh: cái gì mới thật sự là "chính thống"

BJT do JETRO khởi xướng năm 1996, từ 2009 chuyển cho **公益財団法人 日本漢字能力検定協会**
(Japan Kanji Aptitude Testing Foundation) tổ chức. **Từ tháng 4/2017 đề chuyển hoàn toàn
sang CBT** — đúng dạng 80 câu / 3 phần mà dự án này mô phỏng.

Hệ quả quan trọng khi chọn sách:

- Sách phát hành **trước 2017** (kể cả sách "公式") mô tả **cấu trúc đề cũ**, không dùng
  để đối chiếu số câu, thời gian hay dạng câu hỏi. Từ vựng và ngữ pháp trong đó vẫn tốt.
- **Không có sách "công bố 配点 thật"**. Hiệp hội không công khai thang điểm chi tiết.
  Đây là lý do giao diện luôn ghi "điểm tham khảo" — giữ nguyên quy tắc đó.
- **Không có "danh sách từ vựng chính thức" của BJT** theo kiểu 出題基準 của JLPT cũ.
  Thứ gần nhất là 別冊 từ vựng của bộ 実力養成問題集 và 難易度別語彙表 của cuốn カイシャの日本語
  (mục 2.4 và 3.1).

---

## 2. Sách của chính hiệp hội tổ chức thi (nguồn chính thống nhất)

### 2.1 BJTビジネス日本語能力テスト 公式 模擬テスト＆ガイド ⭐ ưu tiên số 1

| | |
|---|---|
| Soạn | 公益財団法人 日本漢字能力検定協会 |
| Phát hành | 11/2017 · 160 trang · kèm CD (tải được trên web) |
| ISBN | 978-4-89096-369-0 |

Cuốn **duy nhất** bám đúng định dạng CBT hiện hành. Gồm một đề mô phỏng đủ ba phần
(聴解 · 聴読解 · 読解), hướng dẫn dự thi có bản dịch tiếng Anh, giải thích đáp án ở
別冊, phụ lục "What's the BJT?".

Dùng để: đối chiếu **văn phong đề bài, cách diễn đạt 指示文, mức độ khó theo từng section**.
Đây là thước đo chuẩn nhất cho việc mình viết đề có "giống thật" không.

### 2.2 BJTビジネス日本語能力テスト 公式ガイド 改訂版

| | |
|---|---|
| Tác giả | 加藤清方 |
| Phát hành | 03/2009 · 116 trang · kèm CD |
| ISBN | 978-4-89096-185-6 |

**Sách thời kỳ đề giấy** — cấu trúc đề đã lỗi thời, đừng dùng để đối chiếu format.
Giá trị còn lại: phần giải thích khái niệm 「ビジネスコミュニケーション能力」 và cách
phân bậc J5–J1+, tức phần *triết lý ra đề*, phần này không đổi.

### 2.3 BJTビジネス日本語能力テスト 体験テストと解説 改訂版

| | |
|---|---|
| Tác giả | 加藤清方 |
| Phát hành | 2009 · kèm CD |
| ISBN | 978-4-89096-186-3 |

Cùng thời kỳ với 2.2, cùng giới hạn.

### 2.4 それ、知りたかった！カイシャの日本語 〜マンガで学ぶ ビジネススキル＆ボキャブラリー〜 ⭐ nguồn từ vựng tốt nhất

| | |
|---|---|
| Tác giả | 池田佳子 · 古川智樹 |
| Phát hành | 03/2023 · 96 trang · 日本漢字能力検定協会 |
| ISBN | 978-4-89096-485-7 |

Do chính hiệp hội tổ chức BJT phát hành. Điểm đắt giá: **難易度別語彙表** — bảng từ vựng
công sở **phân theo độ khó**, kèm câu ví dụ. Đây là thứ gần nhất với một "danh sách từ vựng
tham chiếu" cho BJT, và là nguồn hợp lý nhất để đối chiếu trường `level` của `VocabEntry`.

Ngoài ra sách giải thích thói quen và văn hoá công ty Nhật theo tình huống — trùng đúng
với thứ mình đang ghi ở `noteVi` và `businessNoteVi`.

### 2.5 マンガで体験！にっぽんのカイシャ 〜ビジネス日本語を実践する〜

日本漢字能力検定協会 · ISBN 978-4-89096-352-2. Cùng dòng với 2.4, thiên về tình huống hơn
là từ vựng.

### 2.6 サンプル問題 trên trang chính thức

`kanken.or.jp/bjt/sample/` — đề mẫu ba phần, miễn phí, dạng CBT. Ít câu nhưng là nguồn
**miễn phí và chính thống** để đối chiếu định dạng.

---

## 3. Sách luyện thi của nhà xuất bản lớn (không phải 公式, nhưng là chuẩn de-facto)

### 3.1 BJTビジネス日本語能力テスト 聴解・聴読解 実力養成問題集 第2版 ⭐ ưu tiên số 2

| | |
|---|---|
| Tác giả | 宮崎道子 · 瀬川由美 · 北村貞幸 · 植松真由美 |
| NXB | スリーエーネットワーク |
| Phát hành | 25/06/2018 · kèm 2 CD |
| ISBN | 978-4-88319-768-2 |

Bản 第2版 đã cập nhật theo đề CBT. Hai thứ đáng lấy:

- **別冊「必携・重要ビジネス用語表現集」** — tập từ vựng và mẫu diễn đạt công sở trọng yếu,
  tách riêng thành sách nhỏ. Đây là **nguồn từ vựng số 1 cho phần 聴解/聴読解**.
- Mục 「問題分析」 phân tích xu hướng ra đề từng dạng, có bản tiếng Anh/Trung/Hàn.

### 3.2 BJTビジネス日本語能力テスト 読解 実力養成問題集 第2版

| | |
|---|---|
| Tác giả | 宮崎道子 · 瀬川由美 |
| NXB | スリーエーネットワーク |
| ISBN | 978-4-88319-769-9 |

Cặp đôi của 3.1 cho phần 読解. Bao trùm đúng ba section R1 語彙・文法 · R2 表現読解 ·
R3 総合読解 — tức **nguồn ngữ pháp sát đề nhất** trong toàn bộ danh sách này.

### 3.3 BJTビジネス日本語能力テスト 模試と対策

| | |
|---|---|
| Tác giả | 株式会社パソナHRソリューション |
| NXB | アスク出版 |
| Bản CD | 181 trang · B5 · ISBN 978-4-87217-610-0 |
| Bản 音声DL | ISBN 978-4-86639-918-8 |

Giải thích từng dạng câu hỏi và cách xử lý, kèm 1 đề mô phỏng. Hữu ích cho việc viết
`explanationVi` — cách người Nhật giải thích "vì sao phương án này sai".

---

## 4. Nguồn nền cho ngữ pháp và kính ngữ

### 4.1 敬語の指針（文化審議会答申） ⭐ miễn phí, chuẩn nhà nước

Ban hành **02/02/2007** bởi 文化審議会, công bố công khai trên trang 文化庁:
`bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf`

Đây là **văn bản chuẩn quốc gia về kính ngữ**, tải miễn phí, trích dẫn thoải mái.
Nó chia kính ngữ thành **5 loại** thay vì 3:

| Phân loại 5 nhóm | Ví dụ | `Register` hiện có trong schema |
|---|---|---|
| 尊敬語 | いらっしゃる · おっしゃる | `SONKEIGO` |
| 謙譲語Ⅰ | 伺う · 拝見する (có đối tượng được hạ mình trước) | `KENJOUGO` |
| 謙譲語Ⅱ（丁重語）| 参る · 申す (chỉ hạ mình trước **người nghe**) | `KENJOUGO` ⚠️ gộp |
| 丁寧語 | です · ます | `TEINEIGO` |
| 美化語 | お茶 · ご飯 | *(chưa có)* |

**Đây là một phát hiện cần ghi lại.** Trong `mock/vocab.ts` mình đang gán 参る và 申す là
`KENJOUGO` chung với 拝見する. Theo 敬語の指針 thì 参る/申す là **謙譲語Ⅱ**, khác hẳn về cách
dùng: 謙譲語Ⅰ cần có đối tượng cấp trên, 謙譲語Ⅱ thì không — nói 「明日は雨が降ると存じます」
được, chứ 「電車が参ります」 mà hiểu là hạ mình trước tàu thì sai. Đúng chỗ học viên BJT hay
nhầm, và đúng chỗ đề R1 語彙・文法 hay hỏi.

Xử lý: hoặc mở rộng enum `Register` (đụng schema), hoặc ghi rõ trong `usageNoteVi`.
Xem mục 6.

### 4.2 日本語文型辞典 改訂版

グループ・ジャマシイ biên soạn · くろしお出版 · 09/06/2023 · ISBN 978-4-87424-949-9.

Từ điển mẫu câu kinh điển, **có bản dịch tiếng Việt** — tiện đối chiếu khi viết `meaningVi`
cho `GrammarPoint`.

### 4.3 新装版 どんなときどう使う 日本語表現文型辞典

友松悦子 và cộng sự · アルク · 06/2010 · ISBN 978-4-7574-1886-8.

Bao N5–N1, có chỉ mục theo **chức năng** (54 nhóm: nguyên nhân, mục đích, khả năng…).
Chỉ mục chức năng này hợp để đối chiếu `Tag` thuộc nhóm `function`.

### 4.4 タスクで学ぶ日本語 ビジネスメール・ビジネス文書

村野節子 · 向山陽子 · 山辺真理子 · スリーエーネットワーク · 10/2014 · 90 trang ·
ISBN 978-4-88319-699-9.

Nguồn cho `Register.WRITTEN`: 〜につきましては · 〜ようお願いいたします · cấu trúc
拝啓/敬具, 記/以上. Trùng đúng chủ đề `mail-bunsho` trong `MOCK_VOCAB_TOPICS`.

### 4.5 Sách giáo trình ビジネス日本語 dùng rộng rãi *(chưa xác minh ISBN)*

- **にほんごで働く！ビジネス日本語30時間** — スリーエーネットワーク. Sau sơ cấp, 30 giờ,
  mỗi bài có phần 表現・語彙 rồi tới hội thoại và role-play.
- **新装版 ビジネスのための日本語** — スリーエーネットワーク.
- **しごとの日本語** (bộ nhiều cuốn: メール編 · 電話応対編 · IT編…) — アルク.
- **新装版 実用ビジネス日本語 中級レベルからの** — TOPランゲージ.

### 4.6 Thư mục tra cứu miễn phí

国際交流基金 日本語国際センター (浦和) công bố **「ビジネス日本語の教材」ブックリスト** dạng PDF,
cập nhật theo năm (`jpf.go.jp/j/urawa/j_library/booklist/`). Đây là danh mục do một tổ chức
công lập tổng hợp — chỗ tốt để mở rộng danh sách này về sau mà không phải đoán.

---

## 5. Bản quyền — đọc trước khi nạp dữ liệu

Trích nguồn là việc nên làm, nhưng **ghi nguồn không phải là giấy phép sử dụng**.
Ranh giới thực tế:

| Việc | Đánh giá |
|---|---|
| Lấy **danh sách từ** (稟議書, 打診, 納期…) làm căn cứ chọn từ cần dạy | An toàn. Bản thân từ vựng là sự thật ngôn ngữ, không ai độc quyền. |
| Tự viết `meaningVi`, `noteVi`, câu ví dụ theo cách của mình | An toàn, và đây là giá trị riêng của app. |
| Chép nguyên **câu ví dụ**, **giải thích**, **hội thoại**, **đoạn đọc hiểu** từ sách | **Không được.** Đây là phần được bảo hộ. |
| Chép nguyên **đề thi** từ 公式 模擬テスト hay 過去問 | **Không được**, kể cả có ghi nguồn. |
| Trích ngắn có dẫn nguồn để phân tích/đối chiếu | Được, trong giới hạn 引用 — phải ngắn, phải có bình luận của mình, phần mình viết phải là phần chính. |
| Trích 敬語の指針 | Thoải mái — văn bản công của nhà nước, công bố miễn phí. |

Quy tắc làm việc cho dự án: **sách dùng để quyết định *dạy cái gì*, không dùng để lấy
*câu chữ*.** Trường ghi nguồn trong dữ liệu vì thế mang nghĩa "căn cứ tham khảo"
(参考文献), không phải "trích từ".

---

## 6. Cách gắn nguồn vào dữ liệu — thiết kế đề xuất

Hai phần, phần một không đụng schema, phần hai thì có.

**Phần 1 — sổ đăng ký sách** (`constants/common/contentSources.ts`, chưa làm):
mỗi cuốn một khoá ngắn (`bjt-official-mock-2017`, `kaisha-no-nihongo`, `keigo-shishin`…)
kèm tên tiếng Nhật, tác giả, NXB, năm, ISBN, và cờ `isOfficial`. Giao diện đọc từ đây,
dữ liệu chỉ giữ khoá — đổi cách hiển thị chỉ sửa một chỗ.

**Phần 2 — trường ghi nguồn trong schema** (cần duyệt trước khi sửa
`prisma/schema.prisma`): thêm vào `VocabEntry`, `GrammarPoint` và `QuestionGroup`

```prisma
sourceKey     String?   // khoá trỏ tới contentSources.ts
sourceLocator String?   // "tr. 42" · "第2部 練習3" · "別冊 p.12"
```

Chọn cách này thay vì thêm model `ContentSource` + bảng nối vì giai đoạn hiện tại một mục
chỉ cần **một** nguồn tham chiếu, và mọi mục đều do chủ dự án tự viết. Nếu sau này cần
nhiều nguồn cho một mục thì nâng lên bảng nối, lúc đó dữ liệu đã có sẵn khoá để chuyển.

Hiển thị: một dòng nhỏ cỡ `text-sm` màu `--fg3` cuối thẻ từ vựng / mục ngữ pháp,
dạng 「Tham khảo: カイシャの日本語 (難易度別語彙表)」. Không phải card, không viền —
đúng quy tắc giao diện.
