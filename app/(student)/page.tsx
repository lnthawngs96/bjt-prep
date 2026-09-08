import Link from 'next/link';
import { ScoreRuler } from '@/components/common/ScoreRuler';
import { ListRow } from '@/components/common/ListRow';
import { StartAttemptButton } from '@/components/common/StartAttemptButton';
import { Section, SectionHeading } from '@/components/common/SectionHeading';
import { getStudentDashboard } from '@/lib/data/user';
import { getMockTests } from '@/lib/data/attempts';
import { getSession } from '@/lib/auth-server';
import { pointsToNextBand } from '@/lib/scoring';

export default async function HomePage() {
  const session = await getSession();
  const userId = session?.user.id ?? null;
  const [dash, mockTests] = await Promise.all([getStudentDashboard(userId), getMockTests(userId)]);
  const next = dash.estimatedScore != null ? pointsToNextBand(dash.estimatedScore) : null;
  const done = mockTests.filter((t) => t.lastAttempt).length;

  return (
    <div className="mx-auto max-w-content px-6">
      {/* ---------- Tiếp tục ở đây ---------- */}
      {dash.continueHere && (
        <section className="relative py-13 pb-9">
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-50 -top-14 bottom-0 bg-(image:--glow)"
          />
          <div className="gt relative mb-3.5 flex items-center gap-2.5 text-xs font-bold">
            Tiếp tục ở đây
            <span aria-hidden className="h-0.5 max-w-20 flex-1 rounded-sm bg-(image:--g-line) opacity-65" />
          </div>

          <div className="relative flex flex-wrap items-end gap-5">
            <span className="jp gt text-4xl font-bold leading-none sm:text-6xl">
              {dash.continueHere.partNameJa}
            </span>
            <span className="pb-2 text-base text-fg2">
              Section {dash.continueHere.sectionOrder}, bộ {dash.continueHere.indexNo} —{' '}
              {dash.continueHere.setTitleVi}
            </span>
          </div>

          <p className="relative mt-4 max-w-prose text-sm text-fg2">
            {dash.continueHere.reasonVi}
          </p>

          <div className="relative mt-7 flex flex-wrap items-end gap-y-4">
            <Stat value={`${Math.round(dash.continueHere.accuracy * 100)}%`} label="Tỉ lệ đúng" />
            <Stat
              value={`${dash.continueHere.sectionScore}/${dash.continueHere.sectionMaxScore}`}
              label="Điểm phần này"
            />
            <Stat value={String(dash.continueHere.questionCount)} label="Câu trong bộ" />
            <Stat value={dash.continueHere.level.replace('_PLUS', '+')} label="Mức độ" />
            <StartAttemptButton
              questionSetId={dash.continueHere.setId}
              loadingLabel="Đang mở bài…"
              className="ml-auto rounded-lg bg-(image:--g) px-7 py-3.5 text-sm font-semibold text-on-g shadow-btn transition-all duration-200 hover:-translate-y-px hover:brightness-110"
            >
              Bắt đầu bộ {dash.continueHere.indexNo}
            </StartAttemptButton>
          </div>
        </section>
      )}

      {/* ---------- Điểm ước tính ---------- */}
      <Section>
        <SectionHeading
          title="Điểm ước tính"
          meta={
            <>
              Thang 800
              {dash.daysToExam != null && ` · ${dash.daysToExam} ngày đến kỳ thi`}
            </>
          }
          action={
            <Link href="/mock-test" className="gt">
              Cách tính điểm
            </Link>
          }
        />
        {dash.estimatedScore != null ? (
          <>
            <ScoreRuler score={dash.estimatedScore} />
            <p className="mt-4 text-xs text-fg3">
              Đây là <b className="font-semibold text-fg2">điểm tham khảo</b>, tính 10 điểm mỗi câu
              trên đề đủ 80 câu. BJT thật chấm bằng IRT và không công bố 配点, nên con số này chỉ dùng
              để theo dõi tiến bộ của chính bạn.
              {next && ` Còn ${next.gap} điểm nữa lên bậc ${next.nextLevel.replace('_PLUS', '+')}.`}
            </p>
          </>
        ) : (
          <div className="border-y border-ln py-8">
            <p className="mb-1 text-base font-medium">Chưa có điểm tham khảo</p>
            <p className="mb-5 max-w-prose text-sm text-fg2">
              Làm một đề thi thử đủ 80 câu để có điểm tham khảo trên thang 800 và biết mình đang ở bậc
              nào. Bộ luyện tập chỉ hiện số câu đúng, không quy ra điểm.
            </p>
            <Link
              href="/mock-test"
              className="inline-block rounded-lg border border-ln px-6 py-3 text-sm transition-colors duration-200 hover:border-acc-dim hover:bg-ln2"
            >
              Xem các đề thi thử
            </Link>
          </div>
        )}
      </Section>

      {/* ---------- Việc hôm nay ---------- */}
      <Section>
        <SectionHeading title="Việc hôm nay" meta={`${dash.todayTasks.length} việc`} />
        {dash.todayTasks.map((t, i) => (
          <ListRow
            key={t.id}
            href={t.href}
            index={i + 1}
            title={t.titleVi}
            subtitle={<span className="jp">{t.subtitleVi}</span>}
            meta={t.meta}
          />
        ))}
      </Section>

      {/* ---------- Đang yếu nhất · Tuần này ---------- */}
      <Section>
        <div className="flex flex-wrap items-start gap-x-12 gap-y-8">
          <div className="min-w-65 flex-1">
            <SectionHeading title="Đang yếu nhất" meta="30 ngày qua" />
            {dash.weakSkills.length === 0 && (
              <p className="border-y border-ln py-6 text-sm text-fg3">
                Chưa đủ dữ liệu. Làm vài bộ luyện tập, phần này sẽ chỉ ra đúng kỹ năng bạn hay sai.
              </p>
            )}
            {dash.weakSkills.map((s) => (
              <div key={s.key} className="border-b border-ln py-3 first:border-t first:border-t-ln">
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span>{s.labelVi}</span>
                  <span className="flex-none text-xs font-semibold tabular-nums text-ng">
                    {Math.round(s.accuracy * 100)}%
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-sm bg-ln">
                  <span
                    style={{ width: `${s.accuracy * 100}%` }}
                    className="block h-full rounded-sm bg-(image:--g-ng)"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="min-w-65 flex-1">
            <SectionHeading title="Tuần này" meta={`${dash.weeklyTotal} câu`} />
            <div className="flex h-16 items-end gap-1.5 border-b border-ln">
              {dash.weeklyActivity.map((d) => (
                <i
                  key={d.label}
                  title={`${d.label}: ${d.questions} câu`}
                  style={{ height: `${Math.max(6, d.heightPct)}%` }}
                  className={`flex-1 rounded-t-sm ${d.isToday ? 'bg-(image:--g)' : 'bg-acc-dim'}`}
                />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-fg3">
              {dash.weeklyActivity.map((d) => (
                <span key={d.label}>{d.label}</span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- Đề thi thử ---------- */}
      <Section>
        <SectionHeading
          title="Đề thi thử"
          meta={`${done} đề đã làm · ${mockTests.length - done} đề sẵn sàng`}
        />
        {mockTests.map((t, i) => (
          <ListRow
            key={t.id}
            href={t.lastAttempt ? `/result/${t.lastAttempt.attemptId}` : '/mock-test'}
            index={i + 1}
            title={
              t.lastAttempt ? `${t.titleVi} — ${t.lastAttempt.score} điểm` : `${t.titleVi} — chưa làm`
            }
            subtitle={
              t.lastAttempt
                ? `Làm ngày ${t.lastAttempt.takenAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })} · ${t.lastAttempt.correct}/${t.questionCount} câu đúng`
                : `${t.questionCount} câu · 3 phần · 105 phút`
            }
            meta={t.lastAttempt ? undefined : 'Sẵn sàng'}
          />
        ))}
      </Section>

      <div className="h-40" />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="pr-10">
      <b className="block text-2xl font-semibold tracking-tight tabular-nums">{value}</b>
      <span className="text-xs text-fg3">{label}</span>
    </div>
  );
}
