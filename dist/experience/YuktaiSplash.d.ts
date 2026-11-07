import React, { type ReactNode } from "react";
export interface YuktaiSplashProps {
    /** Your logo or banner (an <img> or SVG). */
    logo: ReactNode;
    /** Site name, read out to screen readers: "Loading YuktaiDocs". */
    title: string;
    /** Words that take turns under the logo. Default: "Welcome" in 7 languages. */
    words?: string[];
    /** Shortest time on screen in ms, counted from when the page started loading. Default 1200. */
    minMs?: number;
    /** "session" (default): once per browser tab. "always": every page load. */
    once?: "session" | "always";
    /** Show a Skip button. Default true. Esc and a click anywhere also skip. */
    skippable?: boolean;
    onDone?: () => void;
}
/**
 * Loading screen: your logo, "Welcome" in English + 6 Indian languages, a progress bar.
 * The visitor's animation choice is respected (Off shows still text). Shown once per tab.
 * Add SPLASH_SCRIPT from @yuktishaalaa/yuktai/head to <head> so returning visitors
 * never see a flash of it.
 */
export declare function YuktaiSplash({ logo, title, words, minMs, once, skippable, onDone }: YuktaiSplashProps): React.JSX.Element | null;
export default YuktaiSplash;
