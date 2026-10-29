export interface SummaryResult {
    success: boolean;
    summary: string;
    error?: string;
}
export declare function checkSummarizerSupport(): Promise<boolean>;
export declare function summarizePage(): Promise<SummaryResult>;
export declare function removeSummaryBox(): void;
