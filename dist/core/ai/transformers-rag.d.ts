export interface RagResult {
    success: boolean;
    answer: string;
    error?: string;
}
export declare function askPageWithTransformers(question: string): Promise<RagResult>;
export declare function answerFromContext(question: string, context: string): Promise<RagResult>;
export declare function isTransformersSupported(): boolean;
export declare function getModelLoadStatus(): "idle" | "loading" | "ready";
