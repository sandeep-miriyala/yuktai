import { type AuditRoot } from "./dom";
export type AuditSeverity = "critical" | "serious" | "moderate" | "minor";
export type AuditRuleId = "html-lang" | "page-title" | "image-alt" | "heading-order" | "single-h1" | "landmark-main" | "form-label" | "button-name" | "link-name" | "color-contrast" | "positive-tabindex" | "keyboard-access" | "duplicate-id" | "form-error" | "target-size";
export interface AuditIssue {
    /** Stable within one report, e.g. "image-alt-3". */
    id: string;
    rule: AuditRuleId;
    severity: AuditSeverity;
    /** WCAG success criterion, e.g. "1.1.1", or "best practice". */
    wcag: string;
    message: string;
    /** Why it matters, in plain English. */
    why: string;
    /** What to change. */
    fix: string;
    selector: string;
    snippet: string;
    /** True when the copilot can apply a safe fix in the browser. */
    autoFixable: boolean;
    element?: Element;
}
export interface AuditCheck {
    rule: AuditRuleId;
    title: string;
    passed: boolean;
    issueCount: number;
}
export interface AuditReport {
    url: string;
    title: string;
    generatedAt: string;
    score: number;
    passed: boolean;
    checks: AuditCheck[];
    issues: AuditIssue[];
    summary: string;
}
export interface AuditOptions {
    root?: AuditRoot;
    /** Skip rules you don't need. */
    skip?: AuditRuleId[];
    /** Cap contrast checks on very large pages (default 600 elements). */
    maxContrastChecks?: number;
    /** Minimum interactive target size in CSS px (WCAG 2.5.8 uses 24). */
    minTargetSize?: number;
}
interface RuleInfo {
    title: string;
    wcag: string;
    severity: AuditSeverity;
    why: string;
}
export declare const AUDIT_RULES: Record<AuditRuleId, RuleInfo>;
export declare function runQaAudit(options?: AuditOptions): AuditReport;
/** Markdown report you can download, paste into a ticket or attach to a PR. */
export declare function auditToMarkdown(report: AuditReport): string;
/** JSON without DOM references, safe to store or send to a server. */
export declare function auditToJSON(report: AuditReport): string;
export {};
