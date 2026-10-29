/**
 * Configuration options for the WCAG accessibility plugin.
 */
export interface A11yConfig {
    /** Whether the plugin is enabled */
    enabled: boolean;
    /** Enable high contrast mode */
    highContrast?: boolean;
    /** Reduce motion for animations and transitions */
    reduceMotion?: boolean;
    /** Automatically apply fixes to new DOM elements */
    autoFix?: boolean;
    /** Root element to scan (defaults to document) */
    root?: HTMLElement | Document;
    /** Skip specific fixes (e.g., ['headings', 'images']) */
    skipFixes?: string[];
    /** Include page validation in the report */
    validate?: boolean;
    level?: "A" | "AA" | "AAA";
}
/**
 * Report of accessibility fixes applied.
 */
export interface A11yReport {
    /** Number of elements fixed */
    fixed: number;
    /** Number of elements scanned */
    scanned: number;
    /** List of errors encountered */
    errors?: string[];
    /** Page validation, when config.validate is set */
    validation?: unknown;
}
/**
 * WCAG Accessibility Plugin
 * Provides automated fixes for common WCAG 2.1 compliance issues.
 */
export declare const wcagPlugin: {
    name: string;
    version: string;
    observer: MutationObserver | null;
    /**
     * Main entry point for the accessibility plugin.
     * @param config Configuration options
     * @returns Promise resolving to a report or status message
     */
    execute(config: A11yConfig): Promise<A11yReport | string>;
    /**
     * Applies accessibility fixes to DOM elements.
     * IMPORTANT: Never modifies 'id' attributes — developer owns those.
     * @param config Configuration options
     * @returns Report of fixes applied
     */
    applyFixes(config: A11yConfig): A11yReport;
    /**
     * Starts observing DOM mutations to apply fixes to new elements.
     * @param config Configuration options
     */
    startObserver(config: A11yConfig): void;
    /**
     * Stops the DOM mutation observer.
     */
    stopObserver(): void;
    /**
     * Cleans up all resources and resets the plugin state.
     */
    cleanup(): void;
    /**
     * Ensures a screen reader live region exists for announcements.
     */
    ensureLiveRegion(): void;
    /**
     * Removes the screen reader live region.
     */
    removeLiveRegion(): void;
    /**
     * Announces a message to screen readers.
     * @param msg Message to announce
     */
    announce(msg: string): void;
    /**
     * Checks if two colors have sufficient contrast ratio.
     * @param fg Foreground color (hex, rgb, or color name)
     * @param bg Background color (hex, rgb, or color name)
     * @param ratio Minimum contrast ratio (default 4.5 for normal text)
     * @returns True if contrast is sufficient
     */
    checkContrast(fg: string, bg: string, ratio?: number): boolean;
    /**
     * Validates the current page for accessibility issues.
     * @returns Detailed report of accessibility status
     */
    validatePage(): {
        score: number;
        issues: string[];
        recommendations: string[];
    };
};
