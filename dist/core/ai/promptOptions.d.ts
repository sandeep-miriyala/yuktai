export declare const PROMPT_LANGUAGES: {
    readonly expectedInputs: readonly [{
        readonly type: "text";
        readonly languages: readonly ["en"];
    }];
    readonly expectedOutputs: readonly [{
        readonly type: "text";
        readonly languages: readonly ["en"];
    }];
};
/** Summarizer, Writer and Rewriter: the same idea, with their option names. */
export declare const WRITING_LANGUAGES: {
    readonly expectedInputLanguages: readonly ["en"];
    readonly expectedContextLanguages: readonly ["en"];
    readonly outputLanguage: "en";
};
/** Languages Chrome's Prompt API accepts for input and output. */
export declare const PROMPT_API_LANGUAGES: readonly ["en", "ja", "es"];
/**
 * Prompt API options for a preferred language. Unsupported languages
 * (Telugu, Hindi, ...) fall back to English, so create() never fails.
 */
export declare function promptLanguagesFor(lang: string): {
    expectedInputs: {
        type: string;
        languages: string[];
    }[];
    expectedOutputs: {
        type: string;
        languages: string[];
    }[];
};
