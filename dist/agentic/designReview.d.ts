import { type AuditRoot } from "./dom";
export type DesignCategory = "hierarchy" | "readability" | "interaction" | "clutter" | "consistency";
export interface DesignFinding {
    category: DesignCategory;
    severity: "high" | "medium" | "low";
    message: string;
    suggestion: string;
    selector?: string;
}
export interface DesignReview {
    score: number;
    categories: Record<DesignCategory, {
        score: number;
        findings: number;
    }>;
    findings: DesignFinding[];
    summary: string;
}
export interface DesignReviewOptions {
    root?: AuditRoot;
    /** Minimum body text size in px (default 14; 16 recommended for seniors). */
    minFontSize?: number;
    /** Maximum comfortable line length in characters (default 90). */
    maxLineLength?: number;
}
export declare function reviewDesign(options?: DesignReviewOptions): DesignReview;
