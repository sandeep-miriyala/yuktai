import { type AuditRoot } from "./dom";
export interface PageOutline {
    title: string;
    description: string;
    language: string;
    headings: Array<{
        level: number;
        text: string;
    }>;
    landmarks: Record<string, number>;
    counts: {
        links: number;
        buttons: number;
        images: number;
        forms: number;
        tables: number;
        fields: number;
    };
    unlabeledFields: Array<{
        type: string;
        hint: string;
        selector: string;
    }>;
    imagesWithoutAlt: Array<{
        src: string;
        selector: string;
    }>;
    purpose: string;
}
export interface PageAnswer {
    intent: PageIntent;
    answer: string;
    /** Elements the answer refers to, so the UI can highlight them. */
    targets: string[];
    suggestions: string[];
}
export type PageIntent = "purpose" | "missing-labels" | "images" | "structure" | "forms" | "links" | "counts" | "unknown";
export declare function analyzePage(root?: AuditRoot): PageOutline;
export declare function detectPageIntent(question: string): PageIntent;
/**
 * Answers a question about the current page.
 * @param summarize Optional hook (e.g. Gemini Nano or your own model) used for "purpose" questions.
 */
export declare function askAboutPage(question: string, options?: {
    root?: AuditRoot;
    summarize?: (pageText: string) => Promise<string>;
}): Promise<PageAnswer>;
