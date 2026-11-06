// Running other programs (cargo, npm, git, next).
// Windows needs a shell to find cargo.cmd / npm.cmd / next.cmd. Node 24 warns (DEP0190) when an
// args array is passed with shell: true, so on Windows we send one quoted command line instead.
import { spawn, spawnSync } from "node:child_process";

export const win = process.platform === "win32";
const quote = (a) => (/[\s"&|<>^]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const line = (cmd, args) => [cmd, ...args].map(quote).join(" ");

export const runSync = (cmd, args, opts = {}) => (win ? spawnSync(line(cmd, args), { ...opts, shell: true }) : spawnSync(cmd, args, opts));
export const run = (cmd, args, opts = {}) => (win ? spawn(line(cmd, args), { ...opts, shell: true }) : spawn(cmd, args, opts));
