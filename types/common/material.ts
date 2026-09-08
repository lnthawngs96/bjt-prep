/**
 * Hình dạng của cột `body` (Json) trong bảng Material, tách theo `kind`.
 *
 * Prisma khai `body` là Json nên không sinh được kiểu cụ thể — đây là chỗ
 * DUY NHẤT mô tả nó. Màn admin sau này soạn tài liệu cũng dùng lại các kiểu
 * này, đừng khai lại ở nơi khác.
 */

/** kind = TABLE — bảng số liệu của phần 聴読解. */
export type MaterialTableBody = {
  caption?: string;
  headers: string[];
  rows: string[][];
  /** Chỉ số cột cần căn phải và dùng tabular-nums. */
  numericColumns?: number[];
};

/** kind = DOCUMENT — chỉ markdown, render qua components/common/Markdown.tsx. */
export type MaterialDocBody = { format: 'markdown'; content: string };

/** kind = CHART — biểu đồ vẽ bằng SVG thuần, không thư viện. */
export type MaterialChartBody = {
  chartType: string;
  caption?: string;
  categories: string[];
  series: { name: string; values: number[] }[];
  axisLabels?: { x?: string; y?: string };
};
