import React, { type ReactNode } from "react";
export interface YuktaiSplashProps {
    /** Your logo or banner (an <img> or SVG). */
    logo: ReactNode;
    /** Site name, read out to screen readers: "Loading YuktaiDocs". */
    title: string;
    /** Words that take turns under the logo. Default: "Welcome" in 7 languages. */
    words?: string[];
    /**
     * Time on screen in ms, counted from when the page started loading. Default 1200.
     * From 4,000 ms the bar fills over that time and the Skip button counts down.
     */
    minMs?: number;
    /** Short lines shown one after another under the bar, for longer loading screens. */
    tips?: string[];
    /** ms each tip stays. Default 3000. */
    tipMs?: number;
    /** "session" (default): once per browser tab. "always": every page load. */
    once?: "session" | "always";
    /** Show a Skip button. Default true. Esc also skips. */
    skippable?: boolean;
    onDone?: () => void;
}
/**
 * Loading screen: your logo, "Welcome" in English + 6 Indian languages, a progress bar.
 * The visitor's animation choice is respected (Off shows still text). Shown once per tab.
 * Add SPLASH_SCRIPT from @yuktishaalaa/yuktai/head to <head> so returning visitors
 * never see a flash of it.
 */
export declare function YuktaiSplash({ logo, title, words, minMs, tips, tipMs, once, skippable, onDone }: YuktaiSplashProps): React.JSX.Element | null;
export default YuktaiSplash;
