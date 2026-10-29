export interface AgentStep {
    text: string;
    type: "info" | "action" | "success" | "error" | "field";
}
export interface AgentResult {
    success: boolean;
    steps: AgentStep[];
    error?: string;
}
export interface FormField {
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
}
export declare function getPageText(): string;
export declare function scanFormFields(): FormField[];
export declare function highlightField(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, durationMs?: number): void;
export declare function scrollToSection(keyword: string): boolean;
export declare function runAgent(task: string, engine: "gemini" | "transformers" | null, onStep: (step: AgentStep) => void): Promise<AgentResult>;
