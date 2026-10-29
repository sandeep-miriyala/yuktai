import { type AuditOptions, type AuditReport } from "./qaAudit";
export interface CopilotFixResult {
    issueId: string;
    applied: boolean;
    message: string;
}
export interface CopilotState {
    report: AuditReport | null;
    watching: boolean;
    appliedFixes: number;
}
export interface A11yCopilotOptions extends AuditOptions {
    /** Called after every scan (initial, manual or caused by DOM changes). */
    onUpdate?: (state: CopilotState) => void;
    /** Wait this long after DOM changes before rescanning (default 600ms). */
    debounceMs?: number;
    /** Apply every safe fix automatically after each scan (default false). */
    autoApply?: boolean;
    /** Language used when the page has no lang attribute (default: browser language). */
    defaultLang?: string;
}
export interface A11yCopilot {
    start(): void;
    stop(): void;
    scan(): AuditReport;
    explain(issueId: string): string;
    applyFix(issueId: string): CopilotFixResult;
    applyAllFixes(): CopilotFixResult[];
    undoAll(): number;
    getState(): CopilotState;
}
export declare function createA11yCopilot(options?: A11yCopilotOptions): A11yCopilot;
