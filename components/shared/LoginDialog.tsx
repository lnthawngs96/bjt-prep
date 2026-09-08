'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaCheck } from 'react-icons/fa6';
import { Modal } from '@/components/ui/Modal';
import { authClient } from '@/lib/auth-client';
import { useAuthDialog } from '@/lib/store/authDialog';
import { cn } from '@/lib/utils';

const PERKS = [
  ['Theo dõi', 'điểm ước tính', 'trên thang 800 và khoảng cách tới bậc tiếp theo'],
  ['Hệ thống', 'ôn từ vựng theo lịch', 'chỉ ôn đúng thứ sắp quên'],
  ['Phân tích', 'điểm yếu theo từng kỹ năng', 'không chỉ theo phần thi'],
] as const;

/** Dựng lại đúng docs/login-dialog.html bằng <Modal> tự viết. */
export function LoginDialog({ googleConfigured = true }: { googleConfigured?: boolean }) {
  const { open, callbackURL, reason, hide } = useAuthDialog();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    if (!googleConfigured) return;
    setLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: 'google',
        // Quay lại đúng trang đang xem dở.
        callbackURL: callbackURL ?? pathname,
      });
    } catch {
      setError('Không kết nối được tới Google. Kiểm tra mạng rồi thử lại.');
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={hide} title="Đăng nhập để bắt đầu">
      <div className="relative px-8 pt-9 text-center">
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-(image:--glow-dlg)" />
        <div className="relative mx-auto mb-5 grid size-[50px] place-items-center rounded-[14px] bg-(image:--g) text-xl font-bold text-on-g shadow-[0_8px_24px_rgba(35,150,232,.36)]">
          B
        </div>
        <p className="relative mb-2 text-[21px] font-bold tracking-[-.03em]">
          Đăng nhập để bắt đầu
        </p>
        <p className="relative mx-auto max-w-[30ch] text-[13.5px] leading-relaxed text-fg2">
          {reason ?? 'Tiến độ học và điểm ước tính của bạn được lưu lại trên mọi thiết bị.'}
        </p>
      </div>

      <div className="px-8 pt-6">
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading || !googleConfigured}
          aria-busy={loading || undefined}
          className={cn(
            'flex w-full items-center justify-center gap-3 rounded-[10px] border border-ln px-4 py-3.5',
            'text-[14.5px] font-medium transition-[border-color,background,transform] duration-200',
            'hover:border-acc hover:bg-ln2 active:scale-[.985] disabled:opacity-70',
          )}
        >
          {loading ? (
            <span
              aria-hidden
              className="size-4 animate-spin rounded-full border-2 border-ln border-t-acc motion-reduce:animate-none"
            />
          ) : (
            <>
              <GoogleMark />
              <span>Tiếp tục với Google</span>
            </>
          )}
        </button>

        {error && (
          <p role="alert" className="mt-3 text-center text-[12px] text-ng">
            {error}
          </p>
        )}

        {!googleConfigured && (
          <p className="mt-3 rounded-lg border border-wr/40 bg-wr-soft px-3 py-2.5 text-[11.5px] leading-relaxed text-wr">
            Chưa cấu hình Google OAuth. Điền <code>GOOGLE_CLIENT_ID</code> và{' '}
            <code>GOOGLE_CLIENT_SECRET</code> vào <code>.env</code> rồi khởi động lại dev server —
            xem <code>docs/google-oauth.md</code>.
          </p>
        )}
      </div>

      <div className="px-8">
        <div className="my-5 flex items-center gap-3 text-[11.5px] text-fg3">
          <span aria-hidden className="h-px flex-1 bg-ln" />
          Bạn sẽ được
          <span aria-hidden className="h-px flex-1 bg-ln" />
        </div>
      </div>

      <ul className="mb-1.5 flex flex-col gap-3 px-8">
        {PERKS.map(([before, strong, after]) => (
          <li key={strong} className="flex items-start gap-3 text-[12.5px] leading-relaxed text-fg2">
            <span className="mt-px grid size-[17px] flex-none place-items-center rounded-[5px] bg-(image:--g-soft)">
              <FaCheck className="size-2 text-acc" />
            </span>
            <span>
              {before} <b className="font-semibold text-fg">{strong}</b> {after}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-ln px-8 pb-7 pt-6 text-center text-[11.5px] leading-[1.7] text-fg3">
        Miễn phí, không cần thẻ. Bằng việc tiếp tục bạn đồng ý với
        <br />
        <a href="/terms" className="font-medium text-acc-hi hover:underline">
          Điều khoản sử dụng
        </a>{' '}
        và{' '}
        <a href="/privacy" className="font-medium text-acc-hi hover:underline">
          Chính sách bảo mật
        </a>
        .
      </div>
    </Modal>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[19px] flex-none">
      <path
        fill="#4285F4"
        d="M22.6 12.2c0-.8-.1-1.6-.2-2.3H12v4.5h6a5.1 5.1 0 0 1-2.2 3.3v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8.3"
      />
      <path
        fill="#34A853"
        d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.8c-1 .7-2.2 1.1-3.6 1.1-2.8 0-5.2-1.9-6-4.4H2.3v2.9A10.9 10.9 0 0 0 12 23"
      />
      <path fill="#FBBC05" d="M6 14.3a6.5 6.5 0 0 1 0-4.2V7.2H2.3a10.9 10.9 0 0 0 0 9.8z" />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1A10.9 10.9 0 0 0 2.3 7.2L6 10.1c.8-2.5 3.2-4.7 6-4.7"
      />
    </svg>
  );
}
