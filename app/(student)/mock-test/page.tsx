import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ListRow } from '@/components/student/ListRow';
import { Section, SectionHeading } from '@/components/student/SectionHeading';
import { getAttemptHistory, getMockTests } from '@/lib/data/attempts';
import { getPartsWithSections } from '@/lib/data/sections';
import { getSession } from '@/lib/auth-server';
import { MOCK_TEST_QUESTION_COUNT, SCORING_BANDS } from '@/lib/scoring';

export const metadata: Metadata = { title: 'Thi thử' };

export default async function MockTestPage() {
  const session = await getSession();
  const userId = session?.user.id ?? null;
  const [tests, history, parts] = await Promise.all([
    getMockTests(userId),
    userId ? getAttemptHistory(userId) : Promise.resolve([]),
    getPartsWithSections(),
  ]);
  const mockHistory = history.filter((a) => a.mode === 'MOCK' && a.finishedAt);

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-10">
      <div className="mb-8">
        <h1 className="mb-2 text-[32px] font-bold tracking-[-.03em]">Thi thử</h1>
        <p className="max-w-[64ch] text-[13.5px] text-fg2">
          Đề mô phỏng đúng cấu trúc kỳ thi thật: {MOCK_TEST_QUESTION_COUNT} câu, ba phần, khoảng 105
          phút. Phần nghe phát audio một lần và không quay lại câu trước được.
        </p>
      </div>

      {/* Cấu trúc đề — cố định, lấy từ tầng dữ liệu */}
      <Section className="border-t-0 pt-0">
        <SectionHeading title="Cấu trúc đề" meta={`${MOCK_TEST_QUESTION_COUNT} câu`} />
        <div className="flex flex-wrap gap-x-10 gap-y-5">
          {parts.map((p) => (
            <div key={p.code} className="min-w-[240px] flex-1">
              <div className="mb-2 flex items-baseline gap-2.5">
                <span className="jp text-[19px] font-bold">{p.nameJa}</span>
                <span className="text-[12px] text-fg2">{p.nameVi}</span>
                <span className="ml-auto text-[11.5px] tabular-nums text-fg3">
                  {p.questionCount} câu · {Math.round(p.timeLimitSec / 60)} phút
                </span>
              </div>
              <ul className="text-[12.5px] text-fg2">
                {p.sections.map((s) => (
                  <li key={s.code} className="flex justify-between border-b border-ln py-1.5">
                    <span className="jp">{s.nameJa}</span>
                    <span className="tabular-nums text-fg3">{s.questionCount}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading title="Đề sẵn có" meta={`${tests.length} đề`} />
        {tests.map((t, i) => {
          const full = t.questionCount >= MOCK_TEST_QUESTION_COUNT;
          const trailing = (
            <span className="flex items-center gap-2.5">
              {!full && t.questionCount > 0 && (
                <Badge tone="wr">
                  Đang soạn · {t.questionCount}/{MOCK_TEST_QUESTION_COUNT} câu
                </Badge>
              )}
              {t.questionCount === 0 && <Badge tone="neutral">Chưa có câu hỏi</Badge>}
              {t.lastAttempt && <Badge tone="ok">{t.lastAttempt.score} điểm</Badge>}
            </span>
          );

          // Đề chưa có câu nào thì không mở được — bấm vào sẽ ra màn thi trắng.
          // Đề đã có câu thì mở lượt mới qua API, kể cả khi chưa đủ 80.
          if (t.questionCount === 0) {
            return (
              <div
                key={t.id}
                className="flex w-full items-center gap-3.5 border-b border-ln px-3 py-3.5 opacity-55 first-of-type:border-t"
              >
                <span className="w-3.5 flex-none text-[11.5px] tabular-nums text-fg3">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <b className="block text-[14.5px] font-medium">{t.titleVi}</b>
                  <span className="block text-[12.5px] text-fg2">{t.descVi}</span>
                </span>
                {trailing}
              </div>
            );
          }

          return (
            <ListRow
              key={t.id}
              mockTestId={t.id}
              index={i + 1}
              title={t.titleVi}
              subtitle={
                full
                  ? t.descVi
                  : `${t.descVi} — đề chưa đủ 80 câu, làm thử được nhưng chưa quy ra thang 800.`
              }
              trailing={trailing}
            />
          );
        })}
      </Section>

      <Section>
        <SectionHeading title="Lịch sử làm bài" meta={`${mockHistory.length} lượt`} />
        {mockHistory.length === 0 ? (
          <p className="border-y border-ln py-10 text-center text-[13.5px] text-fg3">
            Bạn chưa làm đề thi thử nào.
          </p>
        ) : (
          mockHistory.map((a) => (
            <ListRow
              key={a.id}
              href={`/result/${a.id}`}
              title={`${a.estimatedScore} điểm · bậc ${a.estimatedLevel?.replace('_PLUS', '+')}`}
              subtitle={`${a.rawCorrect}/${a.totalQuestions} câu đúng · ${Math.round((a.timeSpentSec ?? 0) / 60)} phút`}
              meta={a.finishedAt?.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            />
          ))
        )}
      </Section>

      <Section>
        <SectionHeading title="Cách tính điểm" />
        <p className="mb-5 max-w-[75ch] text-[13.5px] leading-relaxed text-fg2">
          Mỗi câu 10 điểm, {MOCK_TEST_QUESTION_COUNT} câu là 800 điểm. Đây là{' '}
          <b className="font-semibold text-fg">điểm tham khảo</b>, không phải công thức chính thức:
          BJT thật chấm bằng IRT (có tính đến độ khó từng câu) và tổ chức không công bố 配点. Con số ở
          đây dùng để bạn theo dõi tiến bộ của chính mình qua các lần làm, không so được trực tiếp với
          điểm thi thật.
        </p>
        <ul className="max-w-[520px]">
          {[...SCORING_BANDS].reverse().map((b) => (
            <li key={b.level} className="flex items-baseline gap-4 border-b border-ln py-2.5 first:border-t">
              <span className="w-12 flex-none font-semibold tabular-nums">
                {b.level.replace('_PLUS', '+')}
              </span>
              <span className="w-24 flex-none text-[12.5px] tabular-nums text-fg3">
                {b.min}–{b.max}
              </span>
              <span className="text-[12.5px] text-fg2">{b.labelVi}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[12.5px] text-fg3">
          Muốn luyện từng phần thay vì cả đề?{' '}
          <Link href="/practice" className="gt font-semibold">
            Vào phần luyện thi
          </Link>
          .
        </p>
      </Section>

      <div className="h-40" />
    </div>
  );
}
