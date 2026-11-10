import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "rust/**", "public/**",
    // live demos ported from the earlier site (plain JS style); typed rewrite to follow
    "src/lib/docs/pages/**", "src/lib/docs/data.ts"]),
]);
