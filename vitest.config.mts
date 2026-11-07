import { configDefaults, defineConfig } from "vitest/config"

// packages/* have their own vitest config and run with `npm test` inside them
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "packages/**"],
  },
})
