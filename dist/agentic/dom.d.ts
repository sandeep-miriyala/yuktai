/** Elements inside yuktai's own panels are never audited or read. */
/** YuktAI's own UI: panels, floating buttons (React data-yuktai-ui, vanilla data-yuktai-fabs). Audits skip it. */
export declare const YUKTAI_IGNORE = "[data-yuktai-panel],[data-yuktai-ui],[data-yuktai-fabs]";
export type AuditRoot = Document | Element;
export declare function isBrowser(): boolean;
/** Works across frames/realms, unlike `instanceof Document`. */
export declare function isDocument(node: unknown): node is Document;
export declare function resolveRoot(root?: AuditRoot | null): AuditRoot | null;
/** querySelectorAll that skips yuktai's own UI and hidden elements. */
export declare function queryAll<T extends Element = Element>(root: AuditRoot, selector: string, options?: {
    includeHidden?: boolean;
}): T[];
export declare function isVisible(el: Element): boolean;
/** Collapse whitespace and trim. */
export declare function cleanText(text: string | null | undefined): string;
export declare function shorten(text: string, max?: number): string;
/** A short, readable CSS path such as `main > form:nth-of-type(2) > input`. */
export declare function selectorFor(el: Element): string;
/** The label a screen reader would most likely announce for this element. */
export declare function accessibleName(el: Element): string;
export type RGBA = {
    r: number;
    g: number;
    b: number;
    a: number;
};
export declare function parseColor(value: string | null | undefined): RGBA | null;
/** Paint `top` over `bottom` (simple alpha compositing). */
export declare function blend(top: RGBA, bottom: RGBA): RGBA;
export declare function relativeLuminance(c: RGBA): number;
export declare function contrastRatio(fg: RGBA, bg: RGBA): number;
/**
 * Background actually behind an element: walks up the tree and composites
 * semi-transparent layers over white. Returns null when a background image
 * makes the answer unknowable.
 */
export declare function effectiveBackground(el: Element): RGBA | null;
export declare function isLargeText(el: Element): boolean;
/** True when the element has its own visible text (not only inside children). */
export declare function hasDirectText(el: Element): boolean;
export declare const FOCUSABLE = "a[href],button,input:not([type='hidden']),select,textarea,summary,[tabindex]:not([tabindex='-1']),[contenteditable='true']";
export declare const INTERACTIVE = "a[href],button,input:not([type='hidden']),select,textarea,summary,[role='button'],[role='link'],[role='checkbox'],[role='tab'],[role='menuitem']";
