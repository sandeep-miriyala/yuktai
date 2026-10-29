import { type AuditRoot } from "./dom";
export type FormFindingLevel = "problem" | "improvement";
export interface FormField {
    label: string;
    type: string;
    name: string;
    required: boolean;
    hasVisibleLabel: boolean;
    selector: string;
    element: Element;
}
export interface FormFinding {
    level: FormFindingLevel;
    message: string;
    suggestion: string;
    field?: string;
    selector?: string;
}
export interface FormReview {
    name: string;
    selector: string;
    fields: FormField[];
    findings: FormFinding[];
    /** 0–100, higher is easier to complete. */
    score: number;
    summary: string;
}
export interface FormReviewOptions {
    root?: AuditRoot;
    /** Extra checks for older users: font size, field count, vague buttons (default true). */
    seniorFriendly?: boolean;
    /** Forms with more fields than this get a "split into steps" suggestion (default 8). */
    maxFieldsPerStep?: number;
}
export declare function readFormFields(form: Element): FormField[];
export declare function reviewForm(form: Element, options?: FormReviewOptions): FormReview;
/** Reviews every <form> (and every role="form") on the page. */
export declare function reviewForms(options?: FormReviewOptions): FormReview[];
