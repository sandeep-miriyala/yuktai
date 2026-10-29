export interface LabelResult {
    success: boolean;
    fixed: number;
    elements: {
        tag: string;
        label: string;
    }[];
    error?: string;
}
export declare function checkLabellerSupport(): Promise<boolean>;
export declare function applySmartLabels(): Promise<LabelResult>;
export declare function removeSmartLabels(): void;
