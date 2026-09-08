/**
 * Parser markdown tối giản cho tài liệu đề bài (email, thông báo, 稟議書).
 *
 * Cố ý nhỏ: heading 1–3, đoạn văn, xuống dòng đơn thành <br>, **đậm**,
 * danh sách gạch đầu dòng và đánh số. Mọi thứ khác là chữ thường — kể cả
 * thẻ HTML, nên không có đường nào cho script lọt vào trang.
 *
 * Trả về cây block thuần dữ liệu; components/shared/Markdown.tsx đổi thành
 * React element. Tách như vậy để test được mà không cần DOM.
 */

export type Inline = { type: 'text'; text: string } | { type: 'bold'; text: string } | { type: 'br' };

export type Block =
  | { type: 'heading'; level: 1 | 2 | 3; inlines: Inline[] }
  | { type: 'paragraph'; inlines: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] };

/** `**đậm**` → bold, còn lại là text. */
export function parseInline(line: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const m of line.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ type: 'text', text: line.slice(last, i) });
    out.push({ type: 'bold', text: m[1] });
    last = i + m[0].length;
  }
  if (last < line.length) out.push({ type: 'text', text: line.slice(last) });
  return out;
}

function joinLines(lines: string[]): Inline[] {
  const out: Inline[] = [];
  lines.forEach((l, i) => {
    if (i > 0) out.push({ type: 'br' });
    out.push(...parseInline(l));
  });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) blocks.push({ type: 'paragraph', inlines: joinLines(para) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: 'list', ordered: list.ordered, items: list.items.map(parseInline) });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === '') {
      flushPara();
      flushList();
      continue;
    }

    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      blocks.push({ type: 'heading', level: h[1].length as 1 | 2 | 3, inlines: parseInline(h[2]) });
      continue;
    }

    const ul = /^\s*[-*]\s+(.+)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.+)$/.exec(line);
    if (ul || ol) {
      flushPara();
      const ordered = Boolean(ol);
      const text = (ul ?? ol)![1];
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(text);
      continue;
    }

    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}
