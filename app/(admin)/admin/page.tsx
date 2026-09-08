import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminContent, AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPipelineBar } from '@/components/admin/AdminPipelineBar';
import { getAdminOverview } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Tổng quan · Quản trị' };

export default async function AdminHomePage() {
  const o = await getAdminOverview();
  const tiles: { label: string; value: number; href: string }[] = [
    { label: 'Nhóm câu', value: o.counts.groups, href: '/admin/groups' },
    { label: 'Tài liệu', value: o.counts.materials, href: '/admin/materials' },
    { label: 'Media', value: o.counts.media, href: '/admin/media' },
    { label: 'Từ vựng', value: o.counts.vocab, href: '/admin/vocabulary' },
    { label: 'Ngữ pháp', value: o.counts.grammar, href: '/admin/grammar' },
    { label: 'Bộ luyện tập', value: o.counts.sets, href: '/admin/sets' },
    { label: 'Đề thi thử', value: o.counts.mockTests, href: '/admin/mock-tests' },
    { label: 'Người dùng', value: o.counts.users, href: '/admin/users' },
    { label: 'Lượt làm bài', value: o.counts.attempts, href: '/admin/stats' },
    { label: 'Báo lỗi đang mở', value: o.counts.openReports, href: '/admin/reports' },
  ];
  const totalQuestions = Object.values(o.questionsByStatus).reduce((n, c) => n + c, 0);

  return (
    <>
      <AdminPageHeader title="Tổng quan" />
      <AdminContent>
        <section className="mb-8">
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="text-base font-semibold">Ngân hàng câu hỏi</h2>
            <span className="text-xs text-fg3">{totalQuestions} câu</span>
            <Link href="/admin/questions" className="gt ml-auto text-xs font-semibold">
              Mở danh sách
            </Link>
          </div>
          <AdminPipelineBar counts={o.questionsByStatus} />
        </section>

        {/* Số liệu dạng lưới phân tách bằng đường kẻ — không card. */}
        <section className="grid grid-cols-2 border-t border-l border-ln sm:grid-cols-3 lg:grid-cols-5">
          {tiles.map((t) => (
            <Link key={t.href} href={t.href} className="border-b border-r border-ln px-4 py-5 transition-colors duration-150 hover:bg-ln2">
              <b className="tnum block text-2xl font-semibold tracking-tight">{t.value}</b>
              <span className="text-xs text-fg3">{t.label}</span>
            </Link>
          ))}
        </section>

        <p className="mt-8 max-w-prose text-sm text-fg2">
          Thứ tự nhập nội dung: Media → Tài liệu → Nhóm câu → Câu hỏi → Bộ luyện tập → Đề thi thử. Đề chỉ xuất bản
          được khi đủ 80 câu đúng phân bổ 9 section.
        </p>
      </AdminContent>
    </>
  );
}
