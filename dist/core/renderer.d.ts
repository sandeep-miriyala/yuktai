export type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia" | "achromatopsia";
export type Severity = "critical" | "serious" | "moderate" | "minor";
export type AlertType = "success" | "error" | "info" | "warning";
export interface A11yConfig {
    enabled: boolean;
    highContrast?: boolean;
    darkMode?: boolean;
    reduceMotion?: boolean;
    autoFix?: boolean;
    fontSizeMultiplier?: number;
    colorBlindMode?: ColorBlindMode;
    keyboardHints?: boolean;
    speechEnabled?: boolean;
    showPreferencePanel?: boolean;
    showAuditBadge?: boolean;
    showSkipLinks?: boolean;
    largeTargets?: boolean;
    timeoutWarning?: number;
    dyslexiaFont?: boolean;
    localFont?: string;
    plainEnglish?: boolean;
    summarisePage?: boolean;
    translateLanguage?: string;
    voiceControl?: boolean;
    smartLabels?: boolean;
}
export interface A11yFix {
    tag: string;
    fix: string;
    severity: Severity;
    element: string;
}
export interface A11yReport {
    fixed: number;
    scanned: number;
    renderTime: number;
    score: number;
    details: A11yFix[];
}
declare function speak(text: string, priority?: "polite" | "assertive"): void;
declare function showVisualAlert(message: string, type?: AlertType): void;
declare function announce(message: string, type?: AlertType, useSpeech?: boolean): void;
declare function trapFocus(modal: HTMLElement): void;
declare function handlePlainEnglish(enabled: boolean): Promise<void>;
declare function handleSummarisePage(enabled: boolean): Promise<void>;
declare function handleTranslate(language: string): Promise<void>;
declare function handleVoiceControl(enabled: boolean): Promise<void>;
declare function handleSmartLabels(enabled: boolean): Promise<void>;
export declare const wcagPlugin: {
    name: string;
    version: string;
    observer: MutationObserver | null;
    execute(config: A11yConfig): Promise<string>;
    applyFixes(config: A11yConfig): A11yReport;
    scan(): A11yReport;
    startObserver(config: A11yConfig): void;
    stopObserver(): void;
    announce: typeof announce;
    speak: typeof speak;
    showVisualAlert: typeof showVisualAlert;
    trapFocus: typeof trapFocus;
    handlePlainEnglish: typeof handlePlainEnglish;
    handleSummarisePage: typeof handleSummarisePage;
    handleTranslate: typeof handleTranslate;
    handleVoiceControl: typeof handleVoiceControl;
    handleSmartLabels: typeof handleSmartLabels;
    SUPPORTED_LANGUAGES: {
        code: string;
        label: string;
    }[];
};
export {};
