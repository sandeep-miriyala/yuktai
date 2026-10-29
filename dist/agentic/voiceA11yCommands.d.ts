import { type A11yConfig, type ColorBlindMode } from "../core/renderer";
export type GridNavAction = "next-row" | "previous-row" | "first-row" | "last-row" | "open-row";
export type VoiceA11yCommand = {
    type: "setting";
    patch: Partial<A11yConfig>;
    say: string;
} | {
    type: "reset";
    say: string;
} | {
    type: "grid";
    action: GridNavAction;
    say: string;
};
export declare const FONT_STEP = 0.1;
export declare const FONT_MIN = 0.8;
export declare const FONT_MAX = 1.3;
/**
 * Parses a transcript into a command. `current` is needed for relative
 * changes such as "bigger text". Returns null when nothing matched, so you
 * can pass the transcript on to other handlers (e.g. core/ai/voice.ts).
 */
export declare function parseVoiceA11yCommand(transcript: string, current?: Partial<A11yConfig>): VoiceA11yCommand | null;
export declare const DEFAULT_A11Y_SETTINGS: Partial<A11yConfig>;
export declare function moveGridRowFocus(action: GridNavAction, options?: {
    root?: ParentNode;
    rowSelector?: string;
}): HTMLElement | null;
export interface VoiceA11yControllerOptions {
    /** Current settings; the controller keeps its own copy after each change. */
    initial?: Partial<A11yConfig>;
    /**
     * Apply new settings. Default: yuktai's wcagPlugin.execute.
     * Pass your own to sync with WidgetPanel state or a settings store.
     */
    apply?: (config: A11yConfig) => unknown;
    /** Speech recognition language, e.g. "en-IN" or "te-IN" (default "en-IN"). */
    lang?: string;
    /** Speak a confirmation after each command (default true). */
    speak?: boolean;
    /** Called for every recognised transcript, matched or not. */
    onTranscript?: (text: string, command: VoiceA11yCommand | null) => void;
    gridRoot?: ParentNode;
}
export declare function createVoiceA11yController(options?: VoiceA11yControllerOptions): {
    start: () => boolean;
    stop: () => void;
    /** Run a command from text (also handy for typed commands and tests). */
    handle: (transcript: string) => Promise<VoiceA11yCommand | null>;
    isListening: () => boolean;
    getConfig: () => {
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
    };
};
