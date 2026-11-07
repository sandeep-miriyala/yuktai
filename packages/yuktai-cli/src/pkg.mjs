// package.json for the new app. Versions are pinned to releases that were tested together.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

export const VERSIONS = {
  next: "16.4.5",
  react: "19.3.0",
  yuktai: "5.4.1",
  askPage: "1.0.0",
  typescript: "^5",
  typesNode: "^22",
  typesReact: "^19",
  eslint: "^9",
};

export function writePackageJson(dir, o) {
  const pkg = {
    name: o.name,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "yuktai dev",
      build: "yuktai build",
      lint: "eslint",
      test: "node --test",
    },
    dependencies: {
      "@yuktishaalaa/ask-page": VERSIONS.askPage,
      "@yuktishaalaa/yuktai": VERSIONS.yuktai,
      next: VERSIONS.next,
      react: VERSIONS.react,
      "react-dom": VERSIONS.react,
    },
    devDependencies: {
      "@types/node": VERSIONS.typesNode,
      "@types/react": VERSIONS.typesReact,
      "@types/react-dom": VERSIONS.typesReact,
      eslint: VERSIONS.eslint,
      "eslint-config-next": VERSIONS.next,
      typescript: VERSIONS.typescript,
      yuktai: `^${o.cliVersion}`,
    },
  };
  writeFileSync(join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
}
