// YuktAI watch: every website, npm package, crate and GitHub repo of the owner,
// checked every few hours by GitHub Actions. When something needs a look the run
// fails, and GitHub emails you (its own email, no setup). The detailed table is on
// the run's Summary page.
// No dependencies. Node 20+.
//
//   node scripts/watch.mjs              prints the report; exits 1 when something needs a look
//
// Env:
//   WATCH_OWNER          GitHub user (default: GITHUB_REPOSITORY_OWNER, then sandeep-miriyala)
//   WATCH_NPM            npm maintainer (default: yuktishaalaa)
//   WATCH_CRATES         crates.io names, comma separated (default: yuktai,yuktai-mira)
//   WATCH_PYPI           PyPI names, comma separated (default: yuktai)
//   WATCH_SITES          extra websites, comma separated (repo homepages and GitHub Pages are found by themselves)
//   WATCH_STATE          file that remembers the last run, so the message can say what changed
//   WATCH_REPOS          owner/repo list, comma or newline separated (default: every repo of WATCH_OWNER)
//   WATCH_TOKEN          read-only token for private repos (GitHub secret); else GITHUB_TOKEN
//   WATCH_REPO_PRIVATE   "true" when this workflow runs in a private repo; otherwise private repo
//                        names are hidden in the Actions summary, because anyone can read that page
//   GITHUB_STEP_SUMMARY  set by GitHub Actions; the detailed table goes there

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";

const env = process.env;
const OWNER = env.WATCH_OWNER || env.GITHUB_REPOSITORY_OWNER || "sandeep-miriyala";
const NPM = env.WATCH_NPM || "yuktishaalaa";
const list = (v, d) => (v || d).split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
const CRATES = list(env.WATCH_CRATES, "yuktai,yuktai-mira");
const PYPI = list(env.WATCH_PYPI, "yuktai");
const EXTRA_SITES = list(env.WATCH_SITES, "https://ratnalabala.vercel.app,https://vajasaneyasandhya.vercel.app");
const REPOS = list(env.WATCH_REPOS, "");
const TOKEN = env.WATCH_TOKEN || env.GITHUB_TOKEN;
const LOG_PRIVATE = env.WATCH_REPO_PRIVATE === "true";
const UA = { "user-agent": "yuktai-watch (github.com/sandeep-miriyala/yuktai)" };
const n = (x) => (typeof x === "number" ? x.toLocaleString("en-IN") : "?");

async function get(url, { headers = {}, json = true, timeout = 20000 } = {}) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { headers: { ...UA, ...headers }, redirect: "follow", signal: AbortSignal.timeout(timeout) });
    const ms = Date.now() - t0;
    if (!json) { await res.arrayBuffer(); return { ok: res.ok, status: res.status, ms }; }
    if (!res.ok) return { ok: false, status: res.status, ms };
    return { ok: true, status: res.status, ms, data: await res.json() };
  } catch (e) {
    return { ok: false, status: e.name === "TimeoutError" ? "timeout" : "no answer", ms: Date.now() - t0 };
  }
}

const ghHeaders = { accept: "application/vnd.github+json", ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}) };
const gh = (path) => get(`https://api.github.com${path}`, { headers: ghHeaders });

// ---- GitHub repos -------------------------------------------------------
async function repos() {
  let data, errors = [];
  if (REPOS.length) {
    const got = await Promise.all(REPOS.map((full) => gh(`/repos/${full}`).then((r) => ({ full, r }))));
    errors = got.filter((g) => !g.r.ok).map((g) => `GitHub ${g.r.status} ${g.full}`);
    data = got.filter((g) => g.r.ok).map((g) => g.r.data);
  } else {
    // with a personal token, /user/repos includes private repos; without one, public only
    const r = await gh(env.WATCH_TOKEN ? `/user/repos?per_page=100&affiliation=owner&sort=pushed` : `/users/${OWNER}/repos?per_page=100&type=owner&sort=pushed`);
    if (!r.ok) return { error: `GitHub ${r.status}`, items: [] };
    data = r.data.filter((x) => !x.fork && !x.archived);
  }
  const items = await Promise.all(
    data.map(async (x) => {
      const runs = await gh(`/repos/${x.full_name}/actions/runs?per_page=1&branch=${encodeURIComponent(x.default_branch)}&exclude_pull_requests=true`);
      const run = runs.ok ? runs.data.workflow_runs?.[0] : undefined;
      return {
        name: x.name,
        private: x.private,
        stars: x.stargazers_count,
        issues: x.open_issues_count,
        pushed: x.pushed_at?.slice(0, 10),
        ci: run ? (run.status !== "completed" ? "running" : run.conclusion) : "none",
        ciName: run?.name,
        ciUrl: run?.html_url,
        homepage: x.homepage || "",
        pages: x.has_pages ? (x.name.toLowerCase() === `${OWNER.toLowerCase()}.github.io` ? `https://${x.name}/` : `https://${OWNER.toLowerCase()}.github.io/${x.name}/`) : "",
      };
    }),
  );
  return { items, errors };
}

// ---- npm ----------------------------------------------------------------
async function npm() {
  const r = await get(`https://registry.npmjs.org/-/v1/search?text=maintainer:${NPM}&size=100`);
  if (!r.ok) return { error: `npm ${r.status}`, items: [] };
  const items = await Promise.all(
    r.data.objects.map(async ({ package: p }) => {
      const d = await get(`https://api.npmjs.org/downloads/point/last-week/${p.name}`);
      return { name: p.name, version: p.version, week: d.ok ? d.data.downloads : undefined };
    }),
  );
  return { items: items.sort((a, b) => (b.week ?? 0) - (a.week ?? 0)) };
}

// ---- crates.io and PyPI -------------------------------------------------
const crates = () =>
  Promise.all(CRATES.map(async (c) => {
    const r = await get(`https://crates.io/api/v1/crates/${c}`);
    return r.ok ? { name: c, version: r.data.crate.max_stable_version || r.data.crate.max_version, total: r.data.crate.downloads, recent: r.data.crate.recent_downloads }
                : { name: c, error: r.status };
  }));
const pypi = () =>
  Promise.all(PYPI.map(async (p) => {
    const r = await get(`https://pypi.org/pypi/${p}/json`);
    return r.ok ? { name: p, version: r.data.info.version } : { name: p, error: r.status };
  }));

// ---- websites -----------------------------------------------------------
async function sites(repoItems) {
  const urls = new Set(EXTRA_SITES);
  for (const r of repoItems) for (const u of [r.homepage, r.pages]) if (/^https?:\/\//.test(u)) urls.add(u.replace(/\/?$/, "/"));
  const norm = [...new Set([...urls].map((u) => u.replace(/\/?$/, "/")))];
  return Promise.all(norm.map(async (url) => ({ url, ...(await get(url, { json: false })) })));
}

// ---- run ----------------------------------------------------------------
const [gr, np, cr, py] = await Promise.all([repos(), npm(), crates(), pypi()]);
const st = await sites(gr.items);

const prev = env.WATCH_STATE && existsSync(env.WATCH_STATE) ? JSON.parse(readFileSync(env.WATCH_STATE, "utf8")) : null;
const now = {
  at: new Date().toISOString(),
  stars: Object.fromEntries(gr.items.map((r) => [r.name, r.stars])),
  issues: Object.fromEntries(gr.items.map((r) => [r.name, r.issues])),
  versions: Object.fromEntries([...np.items, ...cr, ...py].filter((x) => x.version).map((x) => [x.name, x.version])),
};
if (env.WATCH_STATE) writeFileSync(env.WATCH_STATE, JSON.stringify(now, null, 1));

const short = (u) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");
const down = st.filter((s) => !s.ok);
const slow = st.filter((s) => s.ok && s.ms > 5000);
const ciBad = gr.items.filter((r) => ["failure", "timed_out", "startup_failure"].includes(r.ci));
const stars = gr.items.reduce((a, r) => a + r.stars, 0);
const issues = gr.items.reduce((a, r) => a + r.issues, 0);
const week = np.items.some((p) => typeof p.week === "number") ? np.items.reduce((a, p) => a + (p.week ?? 0), 0) : undefined;

// what changed since the last run
const changes = [];
if (prev) {
  for (const r of gr.items) {
    const ds = r.stars - (prev.stars[r.name] ?? r.stars);
    const di = r.issues - (prev.issues[r.name] ?? r.issues);
    if (ds > 0) changes.push(`⭐ +${ds} ${r.name}`);
    if (di > 0) changes.push(`🐞 +${di} issue ${r.name}`);
    if (!(r.name in prev.stars)) changes.push(`🆕 repo ${r.name}`);
  }
  for (const [k, v] of Object.entries(now.versions)) if (prev.versions[k] && prev.versions[k] !== v) changes.push(`📦 ${k} ${prev.versions[k]} → ${v}`);
}

const ist = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
const problems = [
  ...down.map((s) => `❌ ${short(s.url)} ${s.status}`),
  ...slow.map((s) => `🐢 ${short(s.url)} ${(s.ms / 1000).toFixed(1)}s`),
  ...ciBad.map((r) => `❌ CI ${r.name}: ${r.ciName}`),
  ...[gr, np].filter((x) => x.error).map((x) => `⚠️ ${x.error}`),
  ...(gr.errors || []).map((e) => `⚠️ ${e}`),
  ...[...cr, ...py].filter((x) => x.error).map((x) => `⚠️ ${x.name} ${x.error}`),
];

const msg = [
  `YuktAI watch · ${ist} IST`,
  `${down.length ? "❌" : "✅"} Websites ${st.length - down.length}/${st.length} up`,
  gr.error ? `⚠️ Repos ? (${gr.error})` : `${ciBad.length ? "❌" : "✅"} Repos ${gr.items.length} · CI ${ciBad.length ? `${ciBad.length} failing` : "ok"}`,
  `📦 npm ${np.items.length} · ${n(week)} downloads/week`,
  `🦀 crates ${cr.map((c) => `${c.name} ${c.version ?? "?"}`).join(", ")}`,
  `🐍 PyPI ${py.map((p) => `${p.name} ${p.version ?? "?"}`).join(", ")}`,
  ...(gr.error ? [] : [`⭐ ${n(stars)} stars · 🐞 ${n(issues)} open issues`]),
  ...(changes.length ? ["", "Since last time:", ...changes.slice(0, 10)] : []),
  ...(problems.length ? ["", "Needs a look:", ...problems.slice(0, 10)] : ["", "All good 👍"]),
].join("\n");

// the Actions page of a public repo is public: keep private repo names out of it
let k = 0;
const hidden = new Map(gr.items.filter((r) => r.private && !LOG_PRIVATE).map((r) => [r.name, `🔒 private ${++k}`]));
// a repo GitHub would not show us may be private too
if (!LOG_PRIVATE) for (const e of gr.errors || []) hidden.set(e.split(" ").pop(), `🔒 repo ${++k}`);
const hide = (t) => { for (const [a, b] of hidden) t = t.split(a).join(b); return t; };

console.log(hide(msg));

// detailed table for the Actions run page
if (env.GITHUB_STEP_SUMMARY) {
  const row = (...c) => `| ${c.join(" | ")} |`;
  appendFileSync(env.GITHUB_STEP_SUMMARY, [
    "## YuktAI watch", "", "```", hide(msg), "```", "",
    "### Websites", row("Site", "Status", "Time"), row("---", "---", "---"),
    ...st.map((s) => row(hide(s.url), `${s.ok ? "✅" : "❌"} ${s.status}`, `${(s.ms / 1000).toFixed(1)}s`)), "",
    "### GitHub repos", row("Repo", "Stars", "Open issues", "Last push", "CI"), row("---", "---", "---", "---", "---"),
    ...gr.items.map((r) => hidden.has(r.name) ? row(hidden.get(r.name), r.stars, r.issues, r.pushed, r.ci) : row(r.name, r.stars, r.issues, r.pushed, r.ciUrl ? `[${r.ci}](${r.ciUrl})` : r.ci)), "",
    "### npm", row("Package", "Version", "Downloads last week"), row("---", "---", "---"),
    ...np.items.map((p) => row(p.name, p.version, n(p.week))), "",
    "### crates.io and PyPI", row("Name", "Version", "Downloads"), row("---", "---", "---"),
    ...cr.map((c) => row(`crate ${c.name}`, c.version ?? c.error, `${n(c.total)} total, ${n(c.recent)} last 90 days`)),
    ...py.map((p) => row(`pypi ${p.name}`, p.version ?? p.error, "")), "",
  ].join("\n"));
}

// Something needs a look: one annotation per problem, then fail the run, so GitHub
// emails you. All good: the run passes quietly (no email).
if (problems.length) {
  for (const p of problems) console.log(`::error title=YuktAI watch::${hide(p).replace(/[\r\n%]/g, " ")}`);
  console.error(`\n${problems.length} thing(s) need a look. GitHub will email you about this failed run.`);
  process.exit(1);
}
console.log("\nAll good. No email.");
