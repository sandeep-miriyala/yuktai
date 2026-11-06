"use client";

import { useState } from "react";
import { AUDIT_RULES, auditToMarkdown, runQaAudit, type AuditReport } from "@yuktishaalaa/yuktai";
import { CopyIcon, DownloadIcon, FactCheckIcon } from "@yuktishaalaa/yuktai/icons";
import { useLifecycle } from "@/components/yuktai/lifecycle";

const SEVERITY = { critical: "Critical", serious: "Serious", moderate: "Moderate", minor: "Minor" } as const;

/**
 * Runs YuktAI's 15 WCAG checks on this page, in the browser.
 * It reads the page's markup and colours only: never what anyone typed into a field.
 */
export default function QaReport() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [practice, setPractice] = useState(false);
  const [copied, setCopied] = useState(false);
  const life = useLifecycle<{ score: number; issues: number }>({ part: "qa" });

  const run = () => {
    // Wait a frame so the practice area (if just switched on) is on the page.
    requestAnimationFrame(() => {
      const root = document.querySelector("main") ?? document;
      const r = runQaAudit({ root });
      setReport(r);
      setCopied(false);
      life.change({ score: r.score, issues: r.issues.length });
    });
  };

  const markdown = () => (report ? auditToMarkdown(report) : "");
  const download = () => {
    const url = URL.createObjectURL(new Blob([markdown()], { type: "text/markdown" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "qa-report.md" });
    a.click();
    URL.revokeObjectURL(url);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(markdown()).catch(() => {});
    setCopied(true);
  };

  return (
    <>
      <div className="btn-row">
        <button type="button" className="btn primary" onClick={run}>
          <FactCheckIcon size={20} aria-hidden="true" /> Check this page
        </button>
        <label className="check">
          <input
            type="checkbox"
            checked={practice}
            onChange={(e) => {
              setPractice(e.target.checked);
              setReport(null);
            }}
          />
          Add a practice area with mistakes
        </label>
      </div>

      {practice && (
        // Deliberate mistakes so the report has something to find. Remove the tick to take them away.
        <div className="practice" role="region" aria-label="Practice area">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icons/icon-192.png`} width={48} height={48} />
          <input type="text" placeholder="Field without a label" />
          <button type="button" className="icon-only" />
          <p style={{ color: "#9a9a9a" }}>Light grey text that is hard to read</p>
        </div>
      )}

      {report && (
        <div className="qa" aria-live="polite">
          <p className={`qa-score ${report.passed ? "ok" : "bad"}`}>
            <strong>{report.score}</strong>/100 · {report.passed ? "passed" : `${report.issues.length} to fix`}
          </p>
          <p>{report.summary}</p>

          <div className="table-box">
            <table>
              <caption className="sr-only">Checks</caption>
              <thead>
                <tr><th scope="col">Check</th><th scope="col">WCAG</th><th scope="col">Result</th></tr>
              </thead>
              <tbody>
                {report.checks.map((c) => (
                  <tr key={c.rule}>
                    <th scope="row">{c.title}</th>
                    <td>{AUDIT_RULES[c.rule]?.wcag}</td>
                    <td>{c.passed ? "✓ Pass" : `✗ ${c.issueCount} found`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.issues.length > 0 && (
            <>
              <h2>What to fix</h2>
              <ol className="issues">
                {report.issues.map((i) => (
                  <li key={i.id}>
                    <strong>{SEVERITY[i.severity]}</strong> · WCAG {i.wcag} · {i.message}
                    <span>{i.fix}</span>
                    <code>{i.selector}</code>
                  </li>
                ))}
              </ol>
            </>
          )}

          <div className="btn-row">
            <button type="button" className="btn" onClick={download}>
              <DownloadIcon size={20} aria-hidden="true" /> Download as Markdown
            </button>
            <button type="button" className="btn" onClick={copy}>
              <CopyIcon size={20} aria-hidden="true" /> {copied ? "Copied" : "Copy Markdown"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
