import React from "react";
import type { A11yReport } from "../core/renderer";
import type { ColorBlindMode } from "../core/renderer";
export interface WidgetSettings {
    highContrast: boolean;
    reduceMotion: boolean;
    autoFix: boolean;
    dyslexiaFont: boolean;
    fontScale: number;
    localFont: string;
    darkMode: boolean;
    largeTargets: boolean;
    speechEnabled: boolean;
    colorBlindMode: ColorBlindMode;
    showAuditBadge: boolean;
    timeoutWarning: number | undefined;
    plainEnglish: boolean;
    summarisePage: boolean;
    translateLanguage: string;
    voiceControl: boolean;
    smartLabels: boolean;
}
export declare const DEFAULT_SETTINGS: WidgetSettings;
export declare const FONT_STEPS: number[];
interface Props {
    position: "left" | "right";
    settings: WidgetSettings;
    report: A11yReport | null;
    isActive: boolean;
    aiSupported: boolean;
    voiceSupported: boolean;
    set: <K extends keyof WidgetSettings>(key: K, val: WidgetSettings[K]) => void;
    onApply: () => void;
    onReset: () => void;
    onClose: () => void;
}
export declare const WidgetPanel: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>>;
export {};
