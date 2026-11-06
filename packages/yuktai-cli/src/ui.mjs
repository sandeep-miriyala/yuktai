// Small terminal helpers: colours (off when NO_COLOR is set or output is not a terminal) and questions.
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const on = stdout.isTTY && !process.env.NO_COLOR;
const wrap = (a, b) => (s) => (on ? `\x1b[${a}m${s}\x1b[${b}m` : String(s));
export const c = { bold: wrap(1, 22), dim: wrap(2, 22), green: wrap(32, 39), cyan: wrap(36, 39), yellow: wrap(33, 39), red: wrap(31, 39) };

export const step = (msg) => console.log(`  ${c.green("✔")} ${msg}`);
export const info = (msg) => console.log(`  ${c.cyan("›")} ${msg}`);
export const warn = (msg) => console.log(`  ${c.yellow("!")} ${msg}`);

let rl = null;
const ask = async (q) => {
  rl ??= createInterface({ input: stdin, output: stdout });
  return (await rl.question(q)).trim();
};
export const closePrompts = () => { rl?.close(); rl = null; };

/** A text answer, with a default. */
export async function text(label, def) {
  const a = await ask(`  ${c.bold("?")} ${label} ${c.dim(`(${def})`)} › `);
  return a || def;
}

/** One choice from a numbered list. Enter keeps the first (recommended) one. */
export async function choose(label, options) {
  console.log(`  ${c.bold("?")} ${label}`);
  options.forEach((o, i) => console.log(`      ${c.cyan(i + 1 + ")")} ${o.label}${o.hint ? c.dim("  " + o.hint) : ""}`));
  for (;;) {
    const a = await ask(`    ${c.dim("number, Enter = 1")} › `);
    if (!a) return options[0].value;
    const n = Number(a);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) return options[n - 1].value;
    console.log(`    ${c.yellow("Type a number from 1 to " + options.length)}`);
  }
}

/** Any number of choices: comma-separated numbers. Enter = all of them, 0 = none. */
export async function chooseMany(label, options) {
  console.log(`  ${c.bold("?")} ${label}`);
  options.forEach((o, i) => console.log(`      ${c.cyan(i + 1 + ")")} ${o.label}${o.hint ? c.dim("  " + o.hint) : ""}`));
  for (;;) {
    const a = await ask(`    ${c.dim("e.g. 1,3  ·  Enter = all  ·  0 = none")} › `);
    if (!a) return options.map((o) => o.value);
    if (a === "0") return [];
    const picks = a.split(/[\s,]+/).filter(Boolean).map(Number);
    if (picks.every((n) => Number.isInteger(n) && n >= 1 && n <= options.length)) return [...new Set(picks)].map((n) => options[n - 1].value);
    console.log(`    ${c.yellow("Use numbers from 1 to " + options.length + ", separated by commas")}`);
  }
}
