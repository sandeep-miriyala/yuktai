export interface RagResult {
    success: boolean;
    answer: string;
    error?: string;
}
export declare function askPage(question: string): Promise<RagResult>;
export declare function askWithContext(question: string, context: string): Promise<RagResult>;
