import React, { type ReactNode } from "react";
import { type UiText } from "./uiLanguage";
/** A select of the 7 site languages. */
export declare function LanguagePicker({ text }: {
    text?: UiText;
}): React.JSX.Element;
/** Device setting / Off / Calm / Lively. The visitor decides how much moves. */
export declare function MotionPicker({ text }: {
    text?: UiText;
}): React.JSX.Element;
export interface YuktaiPreferencesProps {
    /** The button's icon (for example <GlobeIcon />). */
    icon?: ReactNode;
    /** Your own words for the labels. */
    text?: UiText;
    /** Show the language part. Default true. */
    language?: boolean;
    /** Show the animations part. Default true. */
    motion?: boolean;
    /** Extra parts at the end of the panel. */
    children?: ReactNode;
    className?: string;
}
/**
 * One header button with a small panel: site language (English + 6 Indian languages)
 * and animations (Device setting / Off / Calm / Lively). Saved in this browser only.
 */
export declare function YuktaiPreferences({ icon, text, language, motion, children, className }: YuktaiPreferencesProps): React.JSX.Element;
export default YuktaiPreferences;
