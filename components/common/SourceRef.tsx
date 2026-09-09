import { getContentSource } from '@/constants/common/contentSources';
import { cn } from '@/lib/utils';

/**
 * Dòng ghi nguồn tham khảo dưới một mục từ vựng / ngữ pháp.
 *
 * Nghĩa là "soạn theo tham khảo", không phải "trích nguyên văn" — nội dung do
 * chủ dự án tự viết. Xem docs/sources.md.
 *
 * Một dòng chữ nhỏ, không viền không nền: nguồn là thông tin phụ, không được
 * tranh chỗ với nội dung.
 */
export function SourceRef({
  sourceKey,
  sourceLocator,
  className,
}: {
  sourceKey: string | null;
  sourceLocator?: string | null;
  className?: string;
}) {
  if (!sourceKey) return null;

  const src = getContentSource(sourceKey);
  // Khoá chưa đăng ký trong contentSources.ts thì in nguyên khoá, còn hơn mất nguồn.
  const label = src?.shortTitleJa ?? sourceKey;
  const full = src
    ? [src.titleJa, src.authors, `${src.publisher} ${src.year}`, src.isbn && `ISBN ${src.isbn}`]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <p className={cn('text-xs text-fg3', className)} title={full}>
      <span className="font-bold">Tham khảo: </span>
      {src?.url ? (
        <a
          href={src.url}
          target="_blank"
          rel="noreferrer"
          className="jp underline decoration-ln underline-offset-2 transition-colors duration-200 hover:text-fg"
        >
          {label}
        </a>
      ) : (
        <span className="jp">{label}</span>
      )}
      {sourceLocator && <span> · {sourceLocator}</span>}
    </p>
  );
}
