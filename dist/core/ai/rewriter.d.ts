export interface RewriteResult {
    success: boolean;
    original: string;
    rewritten: string;
    error?: string;
}
export declare function checkRewriterSupport(): Promise<boolean>;
export declare function rewriteText(text: string): Promise<RewriteResult>;
export declare function rewritePage(): Promise<{
    fixed: number;
    error?: string;
}>;
export declare function restorePage(): void;
