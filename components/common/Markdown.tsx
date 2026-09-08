import { Fragment } from 'react';
import { parseMarkdown, type Inline } from '@/lib/markdown';
import { cn } from '@/lib/utils';

/**
 * Render markdown của tài liệu đề bài. Mọi chữ đi qua React text node nên tự
 * được escape — không có dangerouslySetInnerHTML ở bất cứ đâu trong app.
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = parseMarkdown(source);
  return (
    <div className={cn('space-y-3', className)}>
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          const Tag = (`h${b.level + 2}`) as 'h3' | 'h4' | 'h5';
          return (
            <Tag key={i} className={cn('font-semibold', b.level === 1 ? 'text-base' : 'text-sm')}>
              <Inlines items={b.inlines} />
            </Tag>
          );
        }
        if (b.type === 'list') {
          const List = b.ordered ? 'ol' : 'ul';
          return (
            <List key={i} className={cn('pl-5', b.ordered ? 'list-decimal' : 'list-disc')}>
              {b.items.map((it, j) => (
                <li key={j}>
                  <Inlines items={it} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={i}>
            <Inlines items={b.inlines} />
          </p>
        );
      })}
    </div>
  );
}

function Inlines({ items }: { items: Inline[] }) {
  return (
    <>
      {items.map((it, i) => {
        if (it.type === 'br') return <br key={i} />;
        if (it.type === 'bold') return <strong key={i}>{it.text}</strong>;
        return <Fragment key={i}>{it.text}</Fragment>;
      })}
    </>
  );
}
