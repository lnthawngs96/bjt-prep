import {
  FaBookOpen,
  FaBug,
  FaChartSimple,
  FaFileLines,
  FaFolderOpen,
  FaGauge,
  FaLayerGroup,
  FaListCheck,
  FaPhotoFilm,
  FaStopwatch,
  FaTableList,
  FaUsers,
} from 'react-icons/fa6';

/** Sidebar admin: hai nhóm "Nội dung" và "Vận hành", theo docs/prototype đã duyệt. */
export const ADMIN_NAV_GROUPS = [
  {
    label: 'Nội dung',
    items: [
      { href: '/admin/questions', label: 'Câu hỏi', Icon: FaListCheck },
      { href: '/admin/groups', label: 'Nhóm câu', Icon: FaLayerGroup },
      { href: '/admin/materials', label: 'Tài liệu', Icon: FaFolderOpen },
      { href: '/admin/media', label: 'Media', Icon: FaPhotoFilm },
      { href: '/admin/vocabulary', label: 'Từ vựng', Icon: FaBookOpen },
      { href: '/admin/grammar', label: 'Ngữ pháp', Icon: FaFileLines },
      { href: '/admin/sets', label: 'Bộ luyện tập', Icon: FaTableList },
      { href: '/admin/mock-tests', label: 'Đề thi thử', Icon: FaStopwatch },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { href: '/admin/users', label: 'Người dùng', Icon: FaUsers },
      { href: '/admin/stats', label: 'Thống kê', Icon: FaChartSimple },
      { href: '/admin/reports', label: 'Báo lỗi', Icon: FaBug },
    ],
  },
] as const;

export const ADMIN_HOME = { href: '/admin', label: 'Tổng quan', Icon: FaGauge } as const;
