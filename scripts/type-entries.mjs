// After `tsc -p tsconfig.build.json` writes dist/**/*.d.ts, add the entry
// files package.json points to: dist/icons.d.ts (the ./icons export) and
// .d.mts twins for ESM-only tools.
import { writeFileSync, existsSync } from "node:fs"

const files = {
  "dist/icons.d.ts": 'export * from "./icons/index";\n',
  "dist/icons.d.mts": 'export * from "./icons/index";\n',
  "dist/index.d.mts": 'export * from "./index";\nexport { default } from "./index";\n',
}
if (!existsSync("dist/index.d.ts") || !existsSync("dist/icons/index.d.ts")) {
  throw new Error("Run tsc -p tsconfig.build.json first: dist/index.d.ts or dist/icons/index.d.ts is missing")
}
for (const [path, text] of Object.entries(files)) writeFileSync(path, text)
console.log("type entries written:", Object.keys(files).join(", "))
