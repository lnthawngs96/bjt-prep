import {
  FaBookOpen,
  FaFileLines,
  FaHeadphones,
  FaHouse,
  FaRankingStar,
  FaStopwatch,
} from 'react-icons/fa6';

/** Nav ngang trên header học viên. `badge` là chỗ gắn số từ vựng tới hạn. */
export const NAV_ITEMS = [
  { href: '/', label: 'Trang chủ', Icon: FaHouse },
  { href: '/vocabulary', label: 'Từ vựng', Icon: FaBookOpen, badge: true },
  { href: '/grammar', label: 'Ngữ pháp', Icon: FaFileLines },
  { href: '/practice', label: 'Luyện thi', Icon: FaHeadphones },
  { href: '/mock-test', label: 'Thi thử', Icon: FaStopwatch },
  { href: '/ranking', label: 'Xếp hạng', Icon: FaRankingStar },
] as const;
