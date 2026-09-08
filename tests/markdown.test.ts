import { describe, expect, it } from 'vitest';
import { parseInline, parseMarkdown } from '@/lib/markdown';

describe('parseMarkdown', () => {
  it('dòng trống tách đoạn, xuống dòng đơn thành <br>', () => {
    const blocks = parseMarkdown('株式会社アオバ\n購買部 佐々木様\n\nいつもお世話になっております。');
    expect(blocks).toEqual([
      {
        type: 'paragraph',
        inlines: [
          { type: 'text', text: '株式会社アオバ' },
          { type: 'br' },
          { type: 'text', text: '購買部 佐々木様' },
        ],
      },
      { type: 'paragraph', inlines: [{ type: 'text', text: 'いつもお世話になっております。' }] },
    ]);
  });

  it('heading 1–3', () => {
    expect(parseMarkdown('# 稟議書\n## 目的\n### 詳細')).toEqual([
      { type: 'heading', level: 1, inlines: [{ type: 'text', text: '稟議書' }] },
      { type: 'heading', level: 2, inlines: [{ type: 'text', text: '目的' }] },
      { type: 'heading', level: 3, inlines: [{ type: 'text', text: '詳細' }] },
    ]);
  });

  it('danh sách gạch đầu dòng và đánh số', () => {
    const blocks = parseMarkdown('- a\n- b\n\n1. x\n2) y');
    expect(blocks).toEqual([
      { type: 'list', ordered: false, items: [[{ type: 'text', text: 'a' }], [{ type: 'text', text: 'b' }]] },
      { type: 'list', ordered: true, items: [[{ type: 'text', text: 'x' }], [{ type: 'text', text: 'y' }]] },
    ]);
  });

  it('đậm', () => {
    expect(parseInline('部数を**200部から300部**に変更')).toEqual([
      { type: 'text', text: '部数を' },
      { type: 'bold', text: '200部から300部' },
      { type: 'text', text: 'に変更' },
    ]);
  });

  it('HTML không lọt — thẻ script chỉ là chữ thường', () => {
    const blocks = parseMarkdown('<script>alert(1)</script>');
    expect(blocks).toEqual([
      { type: 'paragraph', inlines: [{ type: 'text', text: '<script>alert(1)</script>' }] },
    ]);
  });

  it('CRLF xử lý như LF', () => {
    expect(parseMarkdown('a\r\n\r\nb')).toHaveLength(2);
  });
});
