import React, { type ReactNode } from "react";
import { type A11yConfig } from "../core/renderer";
import { type GridEngine } from "../grid/rust/engine";
import { type AgenticPanelProps } from "../agentic/react";
export interface YuktAIWrapperProps {
    position?: "left" | "right";
    children: ReactNode;
    config?: Partial<A11yConfig>;
    showRag?: boolean;
    showAgent?: boolean;
    /** v5.3.9 — show ♿ Accessibility. Setting this (or showVibeCoder/launcher) switches every button to opt-in. */
    showAccessibility?: boolean;
    /** v5.3.9 — show ⚡ Vibe Coder (a developer tool; in legacy mode it follows showAgent). */
    showVibeCoder?: boolean;
    /** v5.3.9 — one ✨ button that shows/hides the others; remembers the choice; Esc closes. */
    launcher?: boolean;
    /**
     * v5.3.9 — 💬 Ask page finds passages first with the page RAG ("rust",
     * "auto" or "ts"), shows them at once, then lets Gemini Nano /
     * Transformers.js write the answer from only those passages.
     * Not set: 💬 works exactly as before.
     */
    engine?: GridEngine;
    /**
     * v5.3.11 — show 🛠 Page tools: Copilot, QA report (15 WCAG checks), Forms,
     * Design, Ask page and Voice, the same panel as the vanilla showPageTools.
     * Adding it does not change which other buttons show.
     */
    showPageTools?: boolean;
    /** v5.3.11 — tab 🛠 opens on: "copilot" (default), "qa", "forms", "design", "ask" or "voice". */
    pageToolsTab?: AgenticPanelProps["defaultTab"];
    /** v5.3.11 — speech language for the 🛠 Voice tab, e.g. "te-IN" (default "en-IN"). */
    voiceLang?: string;
}
export declare function YuktAIWrapper({ position, children, config: configOverrides, showRag, showAgent, showAccessibility, showVibeCoder, launcher, engine, showPageTools, pageToolsTab, voiceLang, }: YuktAIWrapperProps): React.JSX.Element;
