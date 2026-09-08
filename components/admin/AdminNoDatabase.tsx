/** Admin chỉ có nghĩa khi có database — không có nguồn mock cho thao tác ghi. */
export function AdminNoDatabase() {
  return (
    <div className="mx-auto max-w-prose px-7 py-16">
      <p className="gt mb-3 text-xs font-bold">Quản trị</p>
      <h1 className="mb-3 text-2xl font-bold tracking-tight">Chưa bật database</h1>
      <p className="mb-4 text-sm text-fg2">
        Trang quản trị ghi thẳng vào Postgres nên cần <code className="text-fg">DATABASE_URL</code>. Không
        có biến này, app chỉ đọc dữ liệu mẫu và không lưu được gì.
      </p>
      <p className="text-sm text-fg2">
        Làm theo mục 1 trong <code className="text-fg">docs/setup.md</code>, rồi khởi động lại dev server.
      </p>
    </div>
  );
}
