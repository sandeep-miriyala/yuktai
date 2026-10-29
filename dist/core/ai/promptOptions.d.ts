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
