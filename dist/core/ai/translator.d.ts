export declare const SUPPORTED_LANGUAGES: {
    code: string;
    label: string;
}[];
export interface TranslateResult {
    success: boolean;
    language: string;
    fixed: number;
    error?: string;
}
export declare function checkTranslatorSupport(targetLanguage: string): Promise<boolean>;
export declare function translatePage(targetLanguage: string): Promise<TranslateResult>;
export declare function restoreOriginalText(): void;
export declare function getCurrentLanguage(): string;
