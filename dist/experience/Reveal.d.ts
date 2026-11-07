import React, { type CSSProperties, type ReactNode } from "react";
export interface RevealProps {
    children: ReactNode;
    /** Wait this many ms after it comes into view (for a row of cards: 0, 80, 160…). */
    delay?: number;
    /** The element to render. Default "div". */
    as?: "div" | "section" | "li" | "article" | "span";
    className?: string;
    style?: CSSProperties;
}
/**
 * Fades and slides its content in when it scrolls into view.
 * Follows the visitor's animation choice: nothing moves when it is Off.
 * Content is never hidden on the server or without JavaScript.
 */
export declare function Reveal({ children, delay, as, className, style }: RevealProps): React.JSX.Element;
export default Reveal;
