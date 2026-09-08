import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Client do Prisma sinh ra — không phải code của mình.
    "app/generated/**",
  ]),
  {
    rules: {
      // Tham số bỏ trống có chủ ý đặt tiền tố _ — hay gặp ở hàm stub
      // đang chờ nối DB, chữ ký phải giữ nguyên nhưng ruột chưa dùng đến.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // File này CỐ Ý gồm toàn biểu thức trần: đó là cách @ts-expect-error
    // kiểm tra ranh giới bảo mật. Xem phần đầu file để biết lý do.
    files: ["lib/data/security.assert.ts"],
    rules: { "@typescript-eslint/no-unused-expressions": "off" },
  },
]);

export default eslintConfig;
