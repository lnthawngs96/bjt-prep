import type { Question, QuestionGrammar, QuestionOption, QuestionTag, QuestionVocab } from '@/lib/prisma-types';
import { ContentStatus, Level, SectionCode } from '@/lib/prisma-types';
import { stamps } from './_shared';

/**
 * Mỗi câu phải có đủ explanationVi · businessNoteVi · distractorNote từng phương án.
 * Với người học chưa đi làm, biết VÌ SAO ba phương án kia sai còn quan trọng hơn
 * biết phương án nào đúng — đó là chỗ màn hình kết quả tạo ra giá trị thật.
 */

type Q = Omit<Question, 'createdAt' | 'updatedAt'>;

const base = {
  stemFurigana: null,
  correctRate: null,
  discrimination: null,
  attemptCount: 0,
  status: ContentStatus.PUBLISHED,
  createdById: null,
  reviewedById: null,
} satisfies Partial<Q>;

const q: Q[] = [
  /* ---- grp-lr2-007 · 資料聴読解 · 3 câu DÙNG CHUNG một audio và một bảng ---- */
  {
    ...base,
    id: 'q-lr2-007-1',
    groupId: 'grp-lr2-007',
    order: 1,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '達成率が最も高かった地域はどこですか。',
    stemVi: 'Khu vực nào có tỉ lệ đạt mục tiêu cao nhất?',
    audioStartMs: 5200,
    audioEndMs: 18400,
    explanationVi:
      'Đọc cột 達成率 trong bảng: 東北 122% cao hơn 関東 111% và 九州 102%. Bẫy nằm ở chỗ hội thoại khen 田中 (関東) trước và nhắc tên anh ta nhiều nhất, nên người nghe dễ chọn theo ấn tượng âm thanh thay vì đọc bảng. Với dạng 資料聴読解, con số trong tài liệu luôn thắng cảm giác từ audio.',
    businessNoteVi:
      'Trong báo cáo Nhật, 達成率 (tỉ lệ đạt) mới là thước đo được đánh giá, không phải 実績 (số tuyệt đối). 東北 bán ít nhất về giá trị nhưng vượt chỉ tiêu nhiều nhất — và đó là điều được ghi nhận.',
  },
  {
    ...base,
    id: 'q-lr2-007-2',
    groupId: 'grp-lr2-007',
    order: 2,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '佐藤さんが説明した、目標に届かなかった理由は何ですか。',
    stemVi: 'Anh Sato giải thích lý do không đạt mục tiêu là gì?',
    audioStartMs: 25600,
    audioEndMs: 37000,
    explanationVi:
      'Sato nói 「大口の取引先が一社、発注を来期に回した」— một khách hàng lớn dời đơn hàng sang quý sau. Chú ý 回した ở đây nghĩa là "chuyển sang", không phải "huỷ". Đơn hàng vẫn còn, chỉ là rơi vào kỳ khác.',
    businessNoteVi:
      'Khi bị cấp trên hỏi 原因の分析はできていますか, câu trả lời được mong đợi là một nguyên nhân cụ thể và kiểm chứng được, không phải lời xin lỗi. Sato mở đầu bằng 申し訳ございません rồi mới đưa dữ kiện — đúng trình tự công sở Nhật.',
  },
  {
    ...base,
    id: 'q-lr2-007-3',
    groupId: 'grp-lr2-007',
    order: 3,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '課長が指示した内容として、最も適切なものはどれですか。',
    stemVi: 'Nội dung mà trưởng phòng chỉ thị, phương án nào phù hợp nhất?',
    audioStartMs: 37000,
    audioEndMs: 59000,
    explanationVi:
      'Trưởng phòng nói 「佐藤さんに来週の会議までに改善案をまとめてもらいましょう」. Khi cấp trên dùng 〜てもらいましょう / 〜させる với cấp dưới thì đó là CHỈ THỊ, không phải đề nghị — dù hình thức ngữ pháp nghe mềm. Mốc 来週の会議までに xác định hạn chót; ba phương án còn lại không có mốc thời gian nào được nhắc trong hội thoại.',
    businessNoteVi:
      '達成率 dưới 100% thường kéo theo yêu cầu 改善案 bằng văn bản trước cuộc họp tuần sau. Đây là phản xạ mặc định ở công ty Nhật: không đạt số thì nộp phương án cải thiện, không phải giải thích thêm.',
  },

  /* ---- grp-l2-014 · 発言聴解 · có ẢNH ---- */
  {
    ...base,
    id: 'q-l2-014-1',
    groupId: 'grp-l2-014',
    order: 1,
    sectionCode: SectionCode.L2,
    level: Level.J3,
    stemJa: '受付として、最も適切な応答はどれですか。',
    stemVi: 'Với vai lễ tân, cách đáp lại nào phù hợp nhất?',
    audioStartMs: 0,
    audioEndMs: 11000,
    explanationVi:
      'Khách là người ngoài công ty, còn 山田 là người TRONG công ty mình. Nói về người nhà mình với người ngoài thì phải hạ mình: gọi 「山田」không kèm 様/さん, và dùng 謙譲語 「参ります」. 「お待ちしております」cũng là 謙譲語, đúng vai.',
    businessNoteVi:
      'Đây là chỗ người học sai nhiều nhất: 内 và 外. Trong công ty gọi 山田さん hay 山田課長, nhưng trước mặt khách thì gọi trống 山田. Gọi 山田様 với khách nghe như đang tôn kính đồng nghiệp mình trước mặt khách — vừa sai vừa mất lịch sự.',
  },

  /* ---- grp-r1-033 · 語彙・文法 · câu đứng một mình, group 1 câu 0 tài liệu ---- */
  {
    ...base,
    id: 'q-r1-033-1',
    groupId: 'grp-r1-033',
    order: 1,
    sectionCode: SectionCode.R1,
    level: Level.J3,
    stemJa: '部長、資料は明日までに（　）よろしいでしょうか。',
    stemVi: 'Thưa trưởng phòng, tài liệu để đến mai tôi ( ) có được không ạ?',
    audioStartMs: null,
    audioEndMs: null,
    explanationVi:
      'Người nói xin phép LÀM một việc với người trên, nên dùng 謙譲語 「提出させていただいて」— thể sai khiến + ていただく, nghĩa là "xin được cho phép tôi nộp". Đây là mẫu xin phép chuẩn trong công sở.',
    businessNoteVi:
      '〜させていただく bị lạm dụng đến mức có cả tranh luận trong tiếng Nhật hiện đại. Dùng đúng khi có hai điều kiện: việc mình làm cần sự cho phép của đối phương, VÀ mình được lợi từ việc đó. Xin gia hạn nộp tài liệu thoả cả hai.',
  },

  /* ---- grp-r2-021 · 表現読解 · 2 câu dùng chung email ---- */
  {
    ...base,
    id: 'q-r2-021-1',
    groupId: 'grp-r2-021',
    order: 1,
    sectionCode: SectionCode.R2,
    level: Level.J2,
    stemJa: 'このメールで中村さんが最も伝えたいことは何ですか。',
    stemVi: 'Điều anh Nakamura muốn truyền đạt nhất trong email này là gì?',
    audioStartMs: null,
    audioEndMs: null,
    explanationVi:
      'Email có ba tầng: báo trễ hàng (sự việc), xin lỗi (thái độ), rồi đề xuất giao trước một phần (giải pháp). Trọng tâm là tầng cuối — 「代替案として一部を先行してお届けすることも可能でございます」kèm câu hỏi 「ご都合はいかがでしょうか」đang chờ khách trả lời.',
    businessNoteVi:
      'Email xin lỗi trong kinh doanh Nhật gần như luôn kết bằng một phương án thay thế. Chỉ xin lỗi mà không đưa lối ra bị coi là đẩy việc sang cho đối phương.',
  },
  {
    ...base,
    id: 'q-r2-021-2',
    groupId: 'grp-r2-021',
    order: 2,
    sectionCode: SectionCode.R2,
    level: Level.J2,
    stemJa: '新しい納品予定日はいつですか。',
    stemVi: 'Ngày giao hàng dự kiến mới là ngày nào?',
    audioStartMs: null,
    audioEndMs: null,
    explanationVi:
      'Email viết 「現時点では10月12日の納品を見込んでおります」. 10月5日 là ngày đã hứa ban đầu và đã không giữ được — đọc lướt rất dễ bắt nhầm con số xuất hiện trước.',
    businessNoteVi:
      '現時点では ("tại thời điểm hiện tại") là một tín hiệu cần đọc ra: ngày này vẫn có thể đổi tiếp. Người Nhật hiếm khi cam kết tuyệt đối khi tình hình chưa ổn định, và cụm này là cách rào trước.',
  },

  /* ---- grp-lr2-008 · biểu đồ cột · 4 câu ---- */
  {
    ...base,
    id: 'q-lr2-008-1',
    groupId: 'grp-lr2-008',
    order: 1,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '中村さんが最初に指摘した項目はどれですか。',
    stemVi: 'Mục nào là mục anh Nakamura chỉ ra đầu tiên?',
    audioStartMs: 4600,
    audioEndMs: 10200,
    explanationVi:
      'Nakamura nói 「外注費が第2四半期から急に伸びていますね」. Nhìn biểu đồ: 外注費 đi từ 640 lên 720 rồi 980 và 1140 — tăng liên tục. 人件費 gần như đi ngang nên không phải điểm đáng chú ý.',
    businessNoteVi:
      'Khi cấp trên hỏi 「気になる点はありますか」, câu trả lời được mong đợi là chỉ vào MỘT điểm bất thường cụ thể kèm dữ liệu, không phải nhận xét chung chung. Nakamura nêu đúng khoản mục và đúng mốc thời gian.',
  },
  {
    ...base,
    id: 'q-lr2-008-2',
    groupId: 'grp-lr2-008',
    order: 2,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '外注費が増えた理由は何ですか。',
    stemVi: 'Lý do chi phí thuê ngoài tăng là gì?',
    audioStartMs: 10200,
    audioEndMs: 17400,
    explanationVi:
      'Trưởng phòng nói 「人手が足りず、開発の一部を外に出したためです」— thiếu người nên đẩy một phần công việc phát triển ra ngoài. 〜ず là dạng phủ định văn viết của 〜ないで.',
    businessNoteVi:
      '外に出す trong bối cảnh công ty nghĩa là thuê ngoài (外注), không phải "đưa ra ngoài" theo nghĩa đen. Đây là cách nói tắt rất thường gặp trong họp.',
  },
  {
    ...base,
    id: 'q-lr2-008-3',
    groupId: 'grp-lr2-008',
    order: 3,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '来期の広告費について、部長はどう説明していますか。',
    stemVi: 'Về chi phí quảng cáo kỳ tới, trưởng phòng giải thích thế nào?',
    audioStartMs: 17400,
    audioEndMs: 31200,
    explanationVi:
      'Trưởng phòng nói 「広告を絞って、その分を採用に回す方針です」— siết quảng cáo và chuyển phần đó sang tuyển dụng. Chú ý 絞る (siết lại) chứ không phải bỏ hẳn, và その分 chỉ đúng phần tiền cắt được.',
    businessNoteVi:
      'Việc cắt quảng cáo để dồn vào tuyển dụng nối thẳng với câu trước: thiếu người nên phải thuê ngoài, thuê ngoài đắt, nên giải pháp gốc là tuyển thêm. Dạng 総合 luôn thưởng cho người ghép được mạch nhân quả giữa các phát ngôn.',
  },
  {
    ...base,
    id: 'q-lr2-008-4',
    groupId: 'grp-lr2-008',
    order: 4,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '中村さんが明日までにすることは何ですか。',
    stemVi: 'Việc anh Nakamura phải làm trước ngày mai là gì?',
    audioStartMs: 31200,
    audioEndMs: 38600,
    explanationVi:
      'Trưởng phòng chỉ thị 「外注費の内訳を明日までに整理しておいてください」— sắp xếp bảng chi tiết của khoản thuê ngoài. 内訳 là "chi tiết cấu thành", không phải tổng số.',
    businessNoteVi:
      '〜ておいてください là chỉ thị chuẩn bị trước cho một việc sẽ dùng đến sau. Hình thức nghe nhẹ nhưng vẫn là mệnh lệnh có hạn chót — không phải lời gợi ý.',
  },

  /* ---- grp-lr2-009 · bảng lịch họp · 3 câu ---- */
  {
    ...base,
    id: 'q-lr2-009-1',
    groupId: 'grp-lr2-009',
    order: 1,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '鈴木さんが必要としている会議室の時間はどれくらいですか。',
    stemVi: 'Anh Suzuki cần phòng họp trong khoảng bao lâu?',
    audioStartMs: 12800,
    audioEndMs: 18000,
    explanationVi: 'Suzuki nói 「2時間ほどです」. ほど ở đây là "khoảng", không phải mốc chính xác.',
    businessNoteVi:
      'Khi đặt phòng họp, người Nhật thường nói kèm 午後がありがたいです — nêu mong muốn nhưng để ngỏ, tránh áp đặt lịch lên người trên.',
  },
  {
    ...base,
    id: 'q-lr2-009-2',
    groupId: 'grp-lr2-009',
    order: 2,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '水曜日の午後が使えない理由は何ですか。',
    stemVi: 'Lý do chiều thứ Tư không dùng được là gì?',
    audioStartMs: 18000,
    audioEndMs: 26400,
    explanationVi:
      'Phòng họp thứ Tư chiều thì TRỐNG — bảng cho thấy 四半期予算会議 chỉ chiếm 09:30〜12:00. Vấn đề là trưởng phòng bận: 「その日は私が予算会議で終日出られません」. Đây là bẫy chính của câu: phải ghép bảng với audio, chỉ đọc bảng sẽ kết luận ngược.',
    businessNoteVi:
      '終日 nghĩa là cả ngày, dù cuộc họp ghi trên lịch chỉ kéo dài buổi sáng. Họp ngân sách quý thường có phần chuẩn bị và trao đổi kéo dài sau đó, nên người tham dự khoá cả ngày.',
  },
  {
    ...base,
    id: 'q-lr2-009-3',
    groupId: 'grp-lr2-009',
    order: 3,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '最終的に、鈴木さんはいつで先方に打診しますか。',
    stemVi: 'Cuối cùng anh Suzuki sẽ đề xuất với đối tác vào lúc nào?',
    audioStartMs: 26400,
    audioEndMs: 46200,
    explanationVi:
      'Suzuki chốt 「木曜の14時から16時で先方に打診いたします」. Suy ra từ ba ràng buộc: cần 2 tiếng, buổi chiều, và thứ Năm phải xong trước 16 giờ vì có phỏng vấn.',
    businessNoteVi:
      '打診する là "thăm dò ý kiến trước", nhẹ hơn 予約する hay 決める. Với đối tác, lịch chưa được chốt cho đến khi họ đồng ý — dùng sai động từ ở đây là hiểu sai mức độ cam kết.',
  },

  /* ---- grp-l1-001 · 場面把握 · phương án đọc trong audio, textJa = null ---- */
  {
    ...base,
    id: 'q-l1-001-1',
    groupId: 'grp-l1-001',
    order: 1,
    sectionCode: SectionCode.L1,
    level: Level.J3,
    stemJa: '訪問先で初めて会う相手に名刺を渡すとき、何と言いますか。',
    stemVi: 'Khi đưa danh thiếp cho người gặp lần đầu ở công ty khách, bạn nói gì?',
    audioStartMs: 0,
    audioEndMs: 14000,
    explanationVi:
      'Giới thiệu bản thân với người ngoài công ty thì dùng 謙譲語 「〜と申します」 và nêu tên công ty trước tên mình. Phương án 1 「ABC商事の田中と申します」 đúng cả trật tự lẫn tầng lịch sự.',
    businessNoteVi:
      'Trật tự cố định khi tự giới thiệu: công ty → (phòng ban) → họ. Không gắn さん/様 vào tên mình, và ở lần gặp đầu không dùng お世話になります vì hai bên chưa có quan hệ công việc.',
  },
  {
    ...base,
    id: 'q-l1-001-2',
    groupId: 'grp-l1-001',
    order: 2,
    sectionCode: SectionCode.L1,
    level: Level.J3,
    stemJa: '相手から名刺を受け取るとき、何と言いますか。',
    stemVi: 'Khi nhận danh thiếp từ đối phương, bạn nói gì?',
    audioStartMs: 14000,
    audioEndMs: 28000,
    explanationVi:
      'Nhận thứ gì từ người trên hoặc người ngoài công ty thì dùng 謙譲語 「頂戴いたします」. Đây là câu gần như cố định trong 名刺交換.',
    businessNoteVi:
      'Nhận danh thiếp bằng hai tay, nói 頂戴いたします, đọc tên trên thiếp rồi mới cất. Nếu chưa rõ cách đọc tên, hỏi ngay lúc đó là lịch sự; hỏi lại sau mới là thất lễ.',
  },

  /* ---- grp-lr1-001 · 状況把握 · phương án đọc trong audio ---- */
  {
    ...base,
    id: 'q-lr1-001-1',
    groupId: 'grp-lr1-001',
    order: 1,
    sectionCode: SectionCode.LR1,
    level: Level.J3,
    stemJa: '山田さんは今どうしていますか。',
    stemVi: 'Anh Yamada hiện đang thế nào?',
    audioStartMs: 0,
    audioEndMs: 21500,
    explanationVi:
      'Lễ tân nói 「山田はただいま席を外しております」— rời khỏi chỗ ngồi tạm thời. Ảnh cho thấy ghế bàn 山田 trống, khớp với audio. Không có thông tin về họp hay công tác.',
    businessNoteVi:
      '席を外す là cách nói chuẩn khi người được hỏi không có mặt mà không cần nêu lý do. Nói với người ngoài về đồng nghiệp thì bỏ さん và dùng 謙譲語 おります.',
  },
  {
    ...base,
    id: 'q-lr1-001-2',
    groupId: 'grp-lr1-001',
    order: 2,
    sectionCode: SectionCode.LR1,
    level: Level.J3,
    stemJa: '受付の人はこれから何をしますか。',
    stemVi: 'Người lễ tân sẽ làm gì tiếp theo?',
    audioStartMs: 21500,
    audioEndMs: 32000,
    explanationVi:
      'Lễ tân đề nghị 「戻り次第、こちらからお電話いたしましょうか」— khi Yamada về sẽ gọi lại từ phía công ty. 〜次第 nghĩa là "ngay khi".',
    businessNoteVi:
      'Khi người được gọi vắng mặt, thứ tự xử lý chuẩn là: xin lỗi, nêu tình trạng, rồi đề xuất một hướng (gọi lại, nhận lời nhắn). Đề xuất gọi lại là cách phổ biến nhất vì không làm khách phải chờ.',
  },

  /* ---- grp-l3-001 · 総合聴解 · 3 câu, phương án có chữ ---- */
  {
    ...base,
    id: 'q-l3-001-1',
    groupId: 'grp-l3-001',
    order: 1,
    sectionCode: SectionCode.L3,
    level: Level.J2,
    stemJa: '会議はいつになりましたか。',
    stemVi: 'Cuộc họp được chuyển sang lúc nào?',
    audioStartMs: 0,
    audioEndMs: 12000,
    explanationVi:
      'Trưởng phòng nói 「火曜から木曜に変更したい」 rồi 「午前10時からです」. Ghép hai lượt nói mới ra đáp án: thứ Năm, 10 giờ sáng.',
    businessNoteVi:
      'Khi nhận thông báo đổi lịch, nhân viên xác nhận lại bằng cách lặp lại mốc mới 「木曜ですね」 rồi hỏi phần còn thiếu. Đây là phản xạ 確認 được đánh giá cao.',
  },
  {
    ...base,
    id: 'q-l3-001-2',
    groupId: 'grp-l3-001',
    order: 2,
    sectionCode: SectionCode.L3,
    level: Level.J2,
    stemJa: '中村さんはいつまでに資料を送りますか。',
    stemVi: 'Nakamura sẽ gửi tài liệu trước khi nào?',
    audioStartMs: 12000,
    audioEndMs: 30000,
    explanationVi:
      'Trưởng phòng yêu cầu 「前日までに」 (trước ngày hôm trước), Nakamura cụ thể hoá thành 「水曜の午前中にお送りします」. Đáp án là điều Nakamura cam kết, không phải mốc tối thiểu của trưởng phòng.',
    businessNoteVi:
      '〜ておいてください là chỉ thị chuẩn bị trước. Khi nhận chỉ thị có hạn mở như 前日までに, nhân viên giỏi tự đưa ra mốc cụ thể sớm hơn — đó là cách thể hiện chủ động.',
  },
  {
    ...base,
    id: 'q-l3-001-3',
    groupId: 'grp-l3-001',
    order: 3,
    sectionCode: SectionCode.L3,
    level: Level.J2,
    stemJa: '鈴木さんについて、正しいものはどれですか。',
    stemVi: 'Về Suzuki, phương án nào đúng?',
    audioStartMs: 30000,
    audioEndMs: 52000,
    explanationVi:
      '「鈴木さんは木曜が出張なので、議事録を後で共有してあげてください」: Suzuki đi công tác đúng ngày họp, và sẽ nhận biên bản sau. Phải nghe hết cả câu mới ghép được hai ý.',
    businessNoteVi:
      '議事録 gửi cho người vắng mặt là việc mặc định sau mỗi cuộc họp ở công ty Nhật. Người được giao ghi biên bản thường là nhân viên trẻ nhất trong phòng.',
  },

  /* ---- grp-lr3-001 · 総合聴読解 · audio + bảng + email ---- */
  {
    ...base,
    id: 'q-lr3-001-1',
    groupId: 'grp-lr3-001',
    order: 1,
    sectionCode: SectionCode.LR3,
    level: Level.J2,
    stemJa: '案内状の発送はいつ終わりますか。',
    stemVi: 'Việc gửi thư mời sẽ xong khi nào?',
    audioStartMs: 0,
    audioEndMs: 11000,
    explanationVi:
      'Bảng ghi hạn là 9月15日 và trạng thái 進行中, nhưng Sato nói trong audio 「残りは明日中に終わります」. Câu hỏi hỏi thực tế sẽ xong khi nào, nên lấy theo audio: trong ngày mai.',
    businessNoteVi:
      'Dạng 総合聴読解 luôn có ít nhất một chỗ audio cập nhật hoặc phủ định thông tin trên tài liệu. Bảng là trạng thái lúc in, audio là trạng thái mới nhất.',
  },
  {
    ...base,
    id: 'q-lr3-001-2',
    groupId: 'grp-lr3-001',
    order: 2,
    sectionCode: SectionCode.LR3,
    level: Level.J2,
    stemJa: '鈴木さんは今週中に何をしますか。',
    stemVi: 'Trong tuần này Suzuki sẽ làm gì?',
    audioStartMs: 11000,
    audioEndMs: 26000,
    explanationVi:
      'Trưởng phòng chỉ thị 「今週中に見積もりを取ってください」— lấy báo giá, chưa phải in. Email cũng viết 見積もりを取り直してください. Việc in (期限 9月20日) là bước sau.',
    businessNoteVi:
      '見積もりを取る là bước bắt buộc trước mọi chi tiêu ở công ty Nhật, kể cả khi đã có nhà cung cấp quen. Số lượng đổi thì phải lấy lại báo giá.',
  },
  {
    ...base,
    id: 'q-lr3-001-3',
    groupId: 'grp-lr3-001',
    order: 3,
    sectionCode: SectionCode.LR3,
    level: Level.J2,
    stemJa: '資料の印刷部数は何部になりましたか。',
    stemVi: 'Số lượng tài liệu cần in đã thành bao nhiêu bản?',
    audioStartMs: 26000,
    audioEndMs: 45000,
    explanationVi:
      'Email viết rõ 「200部から300部に変更」 và Suzuki xác nhận lại trong audio 「300部で見積もりを依頼します」. Hai nguồn khớp nhau: 300 bản.',
    businessNoteVi:
      'Khi thông tin thay đổi, người Nhật thường lặp lại con số mới thành lời trong cuộc họp để mọi người cùng xác nhận. Nghe thấy con số được lặp lại là dấu hiệu đó là số chốt.',
  },

  /* ---- grp-r3-001 · 総合読解 · 稟議書 ---- */
  {
    ...base,
    id: 'q-r3-001-1',
    groupId: 'grp-r3-001',
    order: 1,
    sectionCode: SectionCode.R3,
    level: Level.J2,
    stemJa: 'この稟議書の目的は何ですか。',
    stemVi: 'Mục đích của đơn xin phê duyệt này là gì?',
    audioStartMs: null,
    audioEndMs: null,
    explanationVi:
      'Mục 目的 viết: máy tính xách tay đi ngoài của phòng kinh doanh đã cũ, hỏng nhiều, nên muốn mua mới 10 máy. Bên đề xuất là 総務部 nhưng người dùng là 営業部 — đọc kỹ chủ ngữ.',
    businessNoteVi:
      '稟議書 là văn bản xin phê duyệt luân chuyển qua nhiều cấp. Mục 目的 luôn phải nêu vấn đề hiện tại rồi mới đến đề xuất; đề xuất không có vấn đề đi kèm thường bị trả lại.',
  },
  {
    ...base,
    id: 'q-r3-001-2',
    groupId: 'grp-r3-001',
    order: 2,
    sectionCode: SectionCode.R3,
    level: Level.J2,
    stemJa: '購入の合計金額はいくらですか。',
    stemVi: 'Tổng số tiền mua là bao nhiêu?',
    audioStartMs: null,
    audioEndMs: null,
    explanationVi:
      'Mục 金額: 1台あたり15万円、合計150万円. 15万 là đơn giá, 40万 là chi phí sửa hàng năm trong 備考 — hai con số gây nhiễu.',
    businessNoteVi:
      '税抜 (chưa thuế) là cách ghi mặc định trong 稟議書. Nếu cần số thực chi, người duyệt sẽ tự cộng 10% thuế tiêu dùng.',
  },
  {
    ...base,
    id: 'q-r3-001-3',
    groupId: 'grp-r3-001',
    order: 3,
    sectionCode: SectionCode.R3,
    level: Level.J2,
    stemJa: '備考の内容として正しいものはどれですか。',
    stemVi: 'Nội dung nào đúng với phần ghi chú?',
    audioStartMs: null,
    audioEndMs: null,
    explanationVi:
      'Mục 備考 có ba ý: máy hiện tại dùng được 6 năm, chi phí sửa khoảng 40万円 mỗi năm, và máy mới sẽ gần như không tốn tiền sửa. Chỉ phương án 2 khớp.',
    businessNoteVi:
      'Phần 備考 trong 稟議書 là nơi đặt lý lẽ về chi phí: số tiền đang mất mỗi năm so với số tiền bỏ ra một lần. Người duyệt nhìn vào đây để quyết định nhanh.',
  },
];

export const MOCK_QUESTIONS: Question[] = q.map((x) => ({ ...x, ...stamps }));
export const MOCK_QUESTION_BY_ID = new Map(MOCK_QUESTIONS.map((x) => [x.id, x]));

/* ============================================================
   PHƯƠNG ÁN — isCorrect và distractorNote KHÔNG BAO GIỜ xuống client trước khi nộp
   ============================================================ */

/** textJa = null khi phương án được đọc trong audio (L1, L2, LR1) — màn thi chỉ hiện số. */
type Opt = [order: number, textJa: string | null, isCorrect: boolean, distractorNote: string | null];

const OPTIONS: Record<string, Opt[]> = {
  'q-lr2-007-1': [
    [1, '関東', false, 'Sai. 関東 đạt 111%, cao nhưng không phải cao nhất. Đây là bẫy chính: hội thoại khen 田中 trước tiên nên tai nghe nhớ khu vực này.'],
    [2, '関西', false, 'Sai. 関西 chỉ đạt 82%, là khu vực duy nhất không đạt mục tiêu.'],
    [3, '九州', false, 'Sai. 九州 đạt 102%, thấp nhất trong ba khu vực có vượt chỉ tiêu.'],
    [4, '東北', true, null],
  ],
  'q-lr2-007-2': [
    [1, '担当者が急に退職したから。', false, 'Sai. Hội thoại không nhắc gì đến chuyện nhân sự nghỉ việc.'],
    [2, '大口の取引先が発注を来期に回したから。', true, null],
    [3, '製品の品質に問題があったから。', false, 'Sai. Vấn đề chất lượng xuất hiện ở tài liệu khác, không có trong hội thoại này.'],
    [4, '目標の設定が高すぎたから。', false, 'Sai. Sato không đổ lỗi cho mục tiêu — nếu nói vậy trong họp thì đó là hành vi bị đánh giá xấu ở công ty Nhật.'],
  ],
  'q-lr2-007-3': [
    [1, '田中さんに関西の支援に入ってもらう。', false, 'Sai. Trưởng phòng có khen 田中 nhưng không hề giao việc hỗ trợ 関西.'],
    [2, '佐藤さんに来週までに改善案を出させる。', true, null],
    [3, '九州の目標を来期から引き上げる。', false, 'Sai. 九州 đạt 102% và được nhắc thoáng qua, không có chỉ thị nào về mục tiêu kỳ sau.'],
    [4, '東北の実績を全社に共有する。', false, 'Gần đúng nhưng không phải chỉ thị chính. Trưởng phòng có nói muốn chia sẻ số liệu 東北, nhưng câu hỏi hỏi 指示した内容 — việc giao cho người khác làm kèm hạn chót, tức là phần của 佐藤.'],
  ],
  'q-l2-014-1': [
    [1, '山田様は少々お待ちください。', false, 'Sai hai chỗ: gọi đồng nghiệp là 山田様 trước mặt khách, và 「お待ちください」lại đang bảo KHÁCH chờ trong khi chủ ngữ là 山田様 — câu không khớp ngữ pháp lẫn vai vế.'],
    [2, '山田はただいま参りますので、少々お待ちくださいませ。', true, null],
    [3, '山田さんが今いらっしゃいますので、お待ちになってください。', false, 'Sai. いらっしゃる là 尊敬語 — dùng để tôn kính người của công ty mình trước mặt khách. Đúng ra phải hạ mình bằng 参る.'],
    [4, '山田課長をお呼びしてまいります。', false, 'Sai. Gắn chức danh 課長 vào tên khi nói với người ngoài cũng là tôn kính người nhà. Với khách chỉ gọi trống 山田.'],
  ],
  'q-r1-033-1': [
    [1, 'お提出になって', false, 'Sai. お〜になる là 尊敬語, dùng cho hành động của NGƯỜI TRÊN. Ở đây người nộp là chính mình nên thành ra tự tôn kính bản thân — lỗi kính ngữ nặng nhất và cũng phổ biến nhất.'],
    [2, '提出させていただいて', true, null],
    [3, '提出してくださって', false, 'Sai. 〜てくださる là người khác làm cho mình. Câu này thành ra nhờ trưởng phòng đi nộp tài liệu.'],
    [4, '提出いたしまして', false, 'Ngữ pháp không sai nhưng không phải xin phép, mà là thông báo mình sẽ nộp. Câu có 「よろしいでしょうか」nên phải là xin phép.'],
  ],
  'q-lr2-008-1': [
    [1, '人件費', false, 'Sai. 人件費 gần như đi ngang (1820 → 1850 → 1910 → 1880), không phải điểm bất thường. Đây là cột cao nhất nên mắt dễ bắt trước.'],
    [2, '外注費', true, null],
    [3, '広告費', false, 'Sai. 広告費 có thay đổi nhưng là giảm, và người nêu ra là chính Nakamura ở lượt SAU, không phải điểm anh ta chỉ ra đầu tiên.'],
    [4, '設備費', false, 'Sai. Biểu đồ không có khoản mục này.'],
  ],
  'q-lr2-008-2': [
    [1, '原材料の価格が上がったから。', false, 'Sai. Hội thoại không nhắc đến giá nguyên vật liệu.'],
    [2, '人手が足りず、開発の一部を外注したから。', true, null],
    [3, '広告の量を増やしたから。', false, 'Sai. Quảng cáo giảm chứ không tăng, và cũng không liên quan đến chi phí thuê ngoài.'],
    [4, '新しい設備を導入したから。', false, 'Sai. Không có chỗ nào nói về đầu tư thiết bị.'],
  ],
  'q-lr2-008-3': [
    [1, '広告費を今のまま維持する。', false, 'Sai. Trưởng phòng nói rõ 絞る — siết lại, tức là giảm tiếp.'],
    [2, '広告を減らし、その分を採用に回す。', true, null],
    [3, '広告費を大幅に増やす。', false, 'Sai, ngược hoàn toàn với xu hướng trên biểu đồ và với lời trưởng phòng.'],
    [4, '広告を完全にやめる。', false, 'Quá mạnh. 絞る là siết lại chứ không phải bỏ hẳn — đây là bẫy về mức độ, rất hay gặp ở J2 trở lên.'],
  ],
  'q-lr2-008-4': [
    [1, '外注先に見積もりを依頼する。', false, 'Sai. Không có chỉ thị nào về việc xin báo giá.'],
    [2, '外注費の内訳を整理する。', true, null],
    [3, '採用計画をまとめる。', false, 'Sai. Tuyển dụng là phương hướng của kỳ tới, không phải việc giao cho Nakamura làm trước ngày mai.'],
    [4, '広告の効果を分析する。', false, 'Sai. Nakamura có hỏi về quảng cáo nhưng không được giao phân tích.'],
  ],
  'q-lr2-009-1': [
    [1, '1時間', false, 'Sai. Suzuki nói 2時間ほど.'],
    [2, '1時間半', false, 'Sai. 1時間半 là độ dài của 定例部会 trên bảng, không phải nhu cầu của Suzuki.'],
    [3, '2時間', true, null],
    [4, '3時間', false, 'Sai. Không có con số này trong hội thoại.'],
  ],
  'q-lr2-009-2': [
    [1, '第2会議室が終日埋まっているから。', false, 'Sai. Bảng cho thấy thứ Tư chỉ có họp ngân sách 09:30〜12:00, buổi chiều phòng còn trống. Đây là bẫy chính — chỉ đọc bảng mà không nghe audio sẽ chọn phương án này.'],
    [2, '課長が予算会議で終日出られないから。', true, null],
    [3, '取引先の都合が悪いから。', false, 'Sai. Hội thoại chưa hề liên lạc với đối tác — mới đang bàn nội bộ.'],
    [4, '人事部が会議室を予約しているから。', false, 'Sai. 人事部 dùng phòng vào thứ Năm chứ không phải thứ Tư.'],
  ],
  'q-lr2-009-3': [
    [1, '水曜の14時から16時', false, 'Sai. Thứ Tư phòng trống nhưng trưởng phòng bận cả ngày.'],
    [2, '木曜の14時から16時', true, null],
    [3, '木曜の16時から18時', false, 'Sai. 16 giờ thứ Năm đã có phỏng vấn tuyển dụng — trưởng phòng nói rõ それより前なら大丈夫.'],
    [4, '金曜の13時から15時', false, 'Sai. Thứ Sáu 13:00〜14:30 đã có báo cáo thăm khách hàng, và cũng không đủ 2 tiếng liền.'],
  ],
  'q-r2-021-1': [
    [1, '注文をキャンセルしたいということ。', false, 'Sai. Không có chỗ nào nói huỷ đơn. Ngược lại, người viết đang tìm cách giao được hàng.'],
    [2, '納期が遅れるので、一部を先に届ける案を提案していること。', true, null],
    [3, '製品の価格を値上げしたいということ。', false, 'Sai. Email không nhắc gì đến giá.'],
    [4, '取引を今後停止したいということ。', false, 'Sai. Kết thư bằng 「何卒よろしくお願い申し上げます」— là mong tiếp tục hợp tác, không phải chấm dứt.'],
  ],
  'q-r2-021-2': [
    [1, '10月5日', false, 'Sai. Đây là ngày đã hứa ban đầu và chính là ngày KHÔNG giữ được. Con số này xuất hiện trước trong thư nên rất dễ bắt nhầm khi đọc lướt.'],
    [2, '10月12日', true, null],
    [3, '10月20日', false, 'Sai. Con số này không có trong thư.'],
    [4, 'まだ決まっていない。', false, 'Sai. Thư có nêu ngày dự kiến cụ thể. 現時点では chỉ báo hiệu ngày có thể đổi, chứ không phải chưa quyết định.'],
  ],

  // L1 · phương án đọc trong audio — distractorNote trích lại lời đọc để màn xem lại còn hiểu được.
  'q-l1-001-1': [
    [1, null, true, null],
    [2, null, false, '「ABC商事の田中さんです」— gắn さん vào tên mình là tự tôn kính bản thân. Lỗi rất phổ biến ở người mới đi làm.'],
    [3, null, false, '「どうも。田中です。よろしく。」— thể thường, thiếu tên công ty. Dùng được với đồng nghiệp thân, không dùng với khách gặp lần đầu.'],
    [4, null, false, '「お世話になります。田中様でございます。」— 様 cho chính mình là sai nặng, và お世話になります không dùng ở lần gặp đầu.'],
  ],
  'q-l1-001-2': [
    [1, null, false, '「はい、もらいます」— もらう là thể thường, không có kính ngữ. Với khách phải là 頂戴いたします hoặc いただきます.'],
    [2, null, true, null],
    [3, null, false, '「ありがとうございます。差し上げます。」— 差し上げる là ĐƯA cho người trên, ngược chiều với việc đang nhận.'],
    [4, null, false, '「お受け取りください」— là câu mời NGƯỜI KIA nhận, dùng khi mình đưa danh thiếp, không phải khi mình nhận.'],
  ],

  // LR1 · phương án đọc trong audio
  'q-lr1-001-1': [
    [1, null, false, '「会議中です」— audio không nhắc đến họp. Đây là bẫy suy đoán từ bối cảnh văn phòng.'],
    [2, null, true, null],
    [3, null, false, '「出張中です」— 席を外す chỉ là rời chỗ tạm thời, không phải đi công tác. Ảnh cũng cho thấy đồ đạc vẫn trên bàn.'],
    [4, null, false, '「退社しました」— nếu đã về thì lễ tân sẽ nói 本日は退社いたしました, và không đề nghị gọi lại "khi quay về".'],
  ],
  'q-lr1-001-2': [
    [1, null, true, null],
    [2, null, false, '「佐々木さんをそのまま待たせる」— để khách chờ trên máy khi không rõ bao lâu là điều tối kỵ; lễ tân đã chủ động đề xuất gọi lại.'],
    [3, null, false, '「別の担当者に電話をつなぐ」— không có lời nào về việc chuyển máy cho người khác.'],
    [4, null, false, '「伝言を断る」— ngược hoàn toàn với thái độ 「お電話いたしましょうか」 của lễ tân.'],
  ],

  // L3
  'q-l3-001-1': [
    [1, '火曜日の午前10時', false, 'Sai. Thứ Ba là lịch CŨ đã bị đổi. Nghe thấy 火曜 trước nên dễ bắt nhầm.'],
    [2, '木曜日の午前10時', true, null],
    [3, '木曜日の午後', false, 'Sai ngày đúng nhưng giờ sai: trưởng phòng nói rõ 午前10時.'],
    [4, '水曜日の午前中', false, 'Sai. Thứ Tư sáng là lúc Nakamura GỬI TÀI LIỆU, không phải giờ họp.'],
  ],
  'q-l3-001-2': [
    [1, '木曜日の朝', false, 'Sai. Trưởng phòng yêu cầu trước ngày hôm trước, và Nakamura cam kết sớm hơn nữa.'],
    [2, '水曜日の午前中', true, null],
    [3, '会議の後', false, 'Sai. Sau cuộc họp là lúc chia sẻ 議事録 cho Suzuki, không phải gửi tài liệu.'],
    [4, '火曜日', false, 'Sai. Thứ Ba không còn liên quan gì sau khi đổi lịch.'],
  ],
  'q-l3-001-3': [
    [1, '会議に出席する。', false, 'Sai. Suzuki đi công tác đúng ngày họp nên không dự được.'],
    [2, '会議の資料を作る。', false, 'Sai. Tài liệu do Nakamura gửi; không ai nói Suzuki làm tài liệu.'],
    [3, '出張のため欠席し、後で議事録を受け取る。', true, null],
    [4, '会議の進行を担当する。', false, 'Sai. Không có chỗ nào nói ai điều hành cuộc họp.'],
  ],

  // LR3
  'q-lr3-001-1': [
    [1, '今日中', false, 'Sai. Sato nói 残りは明日中, không phải hôm nay.'],
    [2, '明日中', true, null],
    [3, '9月15日', false, 'Sai. Đây là HẠN trên bảng, không phải thời điểm thực tế xong việc. Audio cập nhật sớm hơn hạn.'],
    [4, '来週', false, 'Sai. Không có mốc "tuần sau" nào trong cả bảng lẫn audio.'],
  ],
  'q-lr3-001-2': [
    [1, '資料を印刷する。', false, 'Sai. In là việc có hạn 9月20日; tuần này mới là lấy báo giá.'],
    [2, '印刷の見積もりを取る。', true, null],
    [3, '案内状を発送する。', false, 'Sai. Thư mời là việc của Sato.'],
    [4, '会場を予約する。', false, 'Sai. Đặt phòng do Tanaka làm và đã 完了.'],
  ],
  'q-lr3-001-3': [
    [1, '200部', false, 'Sai. 200 là số ban đầu, email nói rõ đã đổi.'],
    [2, '250部', false, 'Sai. Không có con số này ở đâu.'],
    [3, '300部', true, null],
    [4, 'まだ決まっていない。', false, 'Sai. Cả email lẫn audio đều chốt 300 bản.'],
  ],

  // R3
  'q-r3-001-1': [
    [1, '古いパソコンを修理して修理費を減らす。', false, 'Sai. Đơn xin MUA MỚI, không xin sửa. Chi phí sửa được nêu để chứng minh sửa không còn đáng.'],
    [2, '営業部の外出用パソコンを新しくする。', true, null],
    [3, '総務部のパソコンを増やす。', false, 'Sai. 総務部 là bên ĐỀ XUẤT; người dùng máy là 営業部.'],
    [4, 'パソコンをリースに切り替える。', false, 'Sai. Không có chữ リース nào trong văn bản.'],
  ],
  'q-r3-001-2': [
    [1, '15万円', false, 'Sai. Đây là đơn giá một máy.'],
    [2, '40万円', false, 'Sai. Đây là chi phí sửa mỗi năm trong phần 備考.'],
    [3, '150万円', true, null],
    [4, '90万円', false, 'Sai. Không có con số này trong văn bản.'],
  ],
  'q-r3-001-3': [
    [1, '現行機は3年前に購入した。', false, 'Sai. 備考 ghi 6年が経過.'],
    [2, '修理費は年間約40万円かかっている。', true, null],
    [3, '納期は承認後3か月以内である。', false, 'Sai. 納期 là 3 TUẦN (3週間), và nó nằm ở mục 納期, không phải 備考.'],
    [4, '修理費は1台あたり15万円である。', false, 'Sai. 15万円 là giá mua một máy, không phải phí sửa.'],
  ],
};

export const MOCK_OPTIONS: QuestionOption[] = Object.entries(OPTIONS).flatMap(([questionId, opts]) =>
  opts.map(([order, textJa, isCorrect, distractorNote]) => ({
    id: `${questionId}-o${order}`,
    questionId,
    order,
    textJa,
    isCorrect,
    distractorNote,
  })),
);

/* ============================================================
   LIÊN KẾT NGƯỢC — sai câu nào thì biết ôn gì
   ============================================================ */

export const MOCK_QUESTION_TAGS: QuestionTag[] = [
  { questionId: 'q-lr2-007-1', tagId: 'tag-table-numbers' },
  { questionId: 'q-lr2-007-2', tagId: 'tag-progress-report' },
  { questionId: 'q-lr2-007-2', tagId: 'tag-sc-meeting' },
  { questionId: 'q-lr2-007-3', tagId: 'tag-indirect-order' },
  { questionId: 'q-lr2-007-3', tagId: 'tag-sc-report-boss' },
  { questionId: 'q-lr2-007-3', tagId: 'tag-table-numbers' },
  { questionId: 'q-l2-014-1', tagId: 'tag-keigo-facetoface' },
  { questionId: 'q-l2-014-1', tagId: 'tag-sc-visitor' },
  { questionId: 'q-r1-033-1', tagId: 'tag-request-permission' },
  { questionId: 'q-r2-021-1', tagId: 'tag-doc-email-client' },
  { questionId: 'q-r2-021-1', tagId: 'tag-apology-customer' },
  { questionId: 'q-r2-021-2', tagId: 'tag-doc-email-client' },
  { questionId: 'q-lr2-008-1', tagId: 'tag-chart-bar' },
  { questionId: 'q-lr2-008-2', tagId: 'tag-chart-bar' },
  { questionId: 'q-lr2-008-3', tagId: 'tag-sc-meeting' },
  { questionId: 'q-lr2-008-4', tagId: 'tag-indirect-order' },
  { questionId: 'q-lr2-009-1', tagId: 'tag-doc-schedule' },
  { questionId: 'q-lr2-009-2', tagId: 'tag-doc-schedule' },
  { questionId: 'q-lr2-009-3', tagId: 'tag-confirm-info' },
  { questionId: 'q-lr2-009-3', tagId: 'tag-sc-colleague' },
  { questionId: 'q-l1-001-1', tagId: 'tag-sc-meishi' },
  { questionId: 'q-l1-001-1', tagId: 'tag-keigo-facetoface' },
  { questionId: 'q-l1-001-2', tagId: 'tag-sc-meishi' },
  { questionId: 'q-l1-001-2', tagId: 'tag-keigo-facetoface' },
  { questionId: 'q-lr1-001-1', tagId: 'tag-sc-phone' },
  { questionId: 'q-lr1-001-1', tagId: 'tag-keigo-phone' },
  { questionId: 'q-lr1-001-2', tagId: 'tag-sc-phone' },
  { questionId: 'q-l3-001-1', tagId: 'tag-sc-meeting' },
  { questionId: 'q-l3-001-1', tagId: 'tag-confirm-info' },
  { questionId: 'q-l3-001-2', tagId: 'tag-indirect-order' },
  { questionId: 'q-l3-001-3', tagId: 'tag-doc-minutes' },
  { questionId: 'q-lr3-001-1', tagId: 'tag-progress-report' },
  { questionId: 'q-lr3-001-2', tagId: 'tag-indirect-order' },
  { questionId: 'q-lr3-001-2', tagId: 'tag-doc-email-internal' },
  { questionId: 'q-lr3-001-3', tagId: 'tag-doc-email-internal' },
  { questionId: 'q-r3-001-1', tagId: 'tag-doc-ringi' },
  { questionId: 'q-r3-001-2', tagId: 'tag-doc-ringi' },
  { questionId: 'q-r3-001-2', tagId: 'tag-table-numbers' },
  { questionId: 'q-r3-001-3', tagId: 'tag-doc-ringi' },
];

export const MOCK_QUESTION_VOCAB: QuestionVocab[] = [
  { questionId: 'q-l1-001-1', vocabId: 'v-meishi', relevance: 'appears' },
  { questionId: 'q-l1-001-1', vocabId: 'v-mousu', relevance: 'tested' },
  { questionId: 'q-l1-001-2', vocabId: 'v-meishi', relevance: 'appears' },
  { questionId: 'q-lr1-001-1', vocabId: 'v-mousu', relevance: 'appears' },
  { questionId: 'q-lr1-001-1', vocabId: 'v-irassharu', relevance: 'appears' },
  { questionId: 'q-l3-001-3', vocabId: 'v-gijiroku', relevance: 'tested' },
  { questionId: 'q-lr3-001-1', vocabId: 'v-shinchoku', relevance: 'appears' },
  { questionId: 'q-r3-001-1', vocabId: 'v-ringisho', relevance: 'tested' },
  { questionId: 'q-lr2-007-1', vocabId: 'v-tasseiritsu', relevance: 'tested' },
  { questionId: 'q-lr2-007-2', vocabId: 'v-oguchi', relevance: 'appears' },
  { questionId: 'q-lr2-007-3', vocabId: 'v-kaizenan', relevance: 'tested' },
  { questionId: 'q-lr2-007-3', vocabId: 'v-tasseiritsu', relevance: 'appears' },
  { questionId: 'q-l2-014-1', vocabId: 'v-mairu', relevance: 'tested' },
  { questionId: 'q-l2-014-1', vocabId: 'v-irassharu', relevance: 'tested' },
  { questionId: 'q-r2-021-1', vocabId: 'v-daitaian', relevance: 'tested' },
  { questionId: 'q-r2-021-2', vocabId: 'v-nouki', relevance: 'appears' },
];

export const MOCK_QUESTION_GRAMMAR: QuestionGrammar[] = [
  { questionId: 'q-lr2-007-3', grammarId: 'g-temorau', relevance: 'tested' },
  { questionId: 'q-r1-033-1', grammarId: 'g-sasete-itadaku', relevance: 'tested' },
  { questionId: 'q-r2-021-1', grammarId: 'g-degozaimasu', relevance: 'appears' },
  { questionId: 'q-l3-001-2', grammarId: 'g-teoku', relevance: 'tested' },
  { questionId: 'q-lr3-001-2', grammarId: 'g-ni-tsuite', relevance: 'appears' },
  { questionId: 'q-r3-001-1', grammarId: 'g-ni-tsuite', relevance: 'appears' },
];
