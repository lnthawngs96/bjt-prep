import type { Metadata } from 'next';
import { Be_Vietnam_Pro, BIZ_UDPGothic } from 'next/font/google';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-be-vietnam-pro',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Mọi văn bản tiếng Nhật dùng font này qua class `.jp`.
const bizUDPGothic = BIZ_UDPGothic({
  variable: '--font-biz-udpgothic',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BJT — Luyện thi tiếng Nhật thương mại',
    template: '%s · BJT',
  },
  description:
    'Luyện thi BJT (ビジネス日本語能力テスト) cho người Việt: đề thi thử, phân tích điểm yếu theo kỹ năng, ôn từ vựng và ngữ pháp theo lịch.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: next-themes ghi data-theme lên <html> trước khi
    // React hydrate, nếu không có cờ này thì React sẽ cảnh báo lệch server/client.
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${bizUDPGothic.variable} h-full`}
    >
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
