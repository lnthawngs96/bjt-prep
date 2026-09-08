import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Test chỉ chạy logic thuần (scoring, exam-rules, grading, markdown) và
// nguồn mock của tầng dữ liệu. Không cần DOM, không cần database.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
