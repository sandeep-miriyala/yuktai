import type { Metadata } from "next";
import "@/styles/qa.css";
import QaReport from "./QaReport";

export const metadata: Metadata = { title: "QA report" };

export default function QaPage() {
  return (
    <section className="wrap">
      <p className="kicker">QA report</p>
      <h1>Check a page for accessibility</h1>
      <p className="lead">
        Fifteen WCAG 2.2 checks (alt text, labels, contrast, headings, target size and more) run in your browser. You get a score, what
        to fix and a Markdown report to paste into a ticket. The 🛠 button on every page has the same report plus a copilot that applies
        safe fixes.
      </p>
      <QaReport />
      <p className="note">
        In code: <code>runQaAudit({"{ root }"})</code> and <code>auditToMarkdown(report)</code> from <code>@yuktishaalaa/yuktai</code>.
        See <code>src/app/qa/QaReport.tsx</code>.
      </p>
    </section>
  );
}
