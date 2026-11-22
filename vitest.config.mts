import { configDefaults, defineConfig } from "vitest/config"

// packages/* and apps/* have their own tests and run with `npm test` inside them
export default defineConfig({
  // v6: the accessibility engine comes from its source, so no build is needed first
  resolve: { alias: { "@yuktishaalaa/a11y": new URL("./packages/a11y/src/index.ts", import.meta.url).pathname } },
  test: {
    exclude: [...configDefaults.exclude, "packages/**", "apps/**", "site/**"],
  },
})
