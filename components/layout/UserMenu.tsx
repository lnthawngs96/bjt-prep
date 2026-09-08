'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGear, FaRightFromBracket, FaUser } from 'react-icons/fa6';
import { authClient } from '@/lib/auth-client';

/**
 * Avatar + dropdown. Dùng <details>/<summary> gốc: đóng khi bấm ra ngoài,
 * điều khiển bằng bàn phím, không cần JavaScript nào của mình.
 */
export function UserMenu({ name, initials }: { name: string; initials: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <details className="group relative flex-none">
      <summary
        className="grid size-8 cursor-pointer list-none place-items-center rounded-full bg-(image:--g) text-xs font-bold text-on-g [&::-webkit-details-marker]:hidden"
        aria-label={`Tài khoản của ${name}`}
      >
        {initials}
      </summary>

      <div className="absolute right-0 top-9.5 z-50 w-52 overflow-hidden rounded-lg border border-ln bg-bg py-1 shadow-soft">
        <p className="truncate border-b border-ln px-3.5 pb-2.5 pt-2 text-xs text-fg2">{name}</p>
        <MenuLink href="/profile" Icon={FaUser}>
          Hồ sơ
        </MenuLink>
        <MenuLink href="/settings" Icon={FaGear}>
          Cài đặt
        </MenuLink>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-fg2 transition-colors duration-150 hover:bg-ln2 hover:text-fg"
        >
          <FaRightFromBracket className="size-3.5" />
          Đăng xuất
        </button>
      </div>
    </details>
  );
}

function MenuLink({
  href,
  Icon,
  children,
}: {
  href: string;
  Icon: typeof FaUser;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-fg2 transition-colors duration-150 hover:bg-ln2 hover:text-fg"
    >
      <Icon className="size-3.5" />
      {children}
    </Link>
  );
}
