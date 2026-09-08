import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import { isGoogleConfigured } from '@/lib/auth';
import { LoginFallback } from '@/components/login/LoginFallback';

export const metadata: Metadata = { title: 'Đăng nhập' };

/**
 * Trang dự phòng cho deep link và cho redirect từ Google.
 *
 * Luồng chính KHÔNG đi qua đây: bấm vào tính năng cần đăng nhập thì dialog mở
 * tại chỗ. Trang này chỉ dùng khi có người vào thẳng /login, hoặc khi
 * proxy.ts đá ra từ /admin.
 */
export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const session = await getSession();
  const { next } = await searchParams;
  const callbackURL = typeof next === 'string' && next.startsWith('/') ? next : '/';

  if (session) redirect(callbackURL);

  return <LoginFallback callbackURL={callbackURL} googleConfigured={isGoogleConfigured} />;
}
