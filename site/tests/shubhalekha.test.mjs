// శుభలేఖ తయారీ పేజీలోని fonts జాబితా, package లోని జాబితా ఒకటే అయి ఉండాలి.
// (పేజీ చూపించిన font ను సేవ తిరస్కరించకూడదు.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const pkg = new URL("../../packages/shubhalekha/src/fonts.js", import.meta.url);
const data = readFileSync(new URL("../src/data/shubhalekha.ts", import.meta.url), "utf8");
const grab = (name) => JSON.parse(data.match(new RegExp(`export const ${name}[^=]*= (\\{[\\s\\S]*?\\});`))[1]);

test("maker fonts match the package", { skip: !existsSync(pkg) && "package not in this checkout" }, async () => {
  const { FONTS, SCRIPT_OF } = await import(pkg);
  assert.deepEqual(grab("FONTS"), FONTS);
  assert.deepEqual(grab("SCRIPT_OF"), SCRIPT_OF);
});

test("the maker page was built", { skip: !existsSync(new URL("../out/index.html", import.meta.url)) && "run npm run build first" }, () => {
  const html = readFileSync(new URL("../out/shubhalekha/make/index.html", import.meta.url), "utf8");
  assert.match(html, /శుభలేఖ తయారీ/);
});
