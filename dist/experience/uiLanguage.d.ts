export type UiLanguage = "en" | "te" | "hi" | "ta" | "kn" | "ml" | "bn";
export declare const UI_LANGUAGES: {
    code: UiLanguage;
    name: string;
    english: string;
}[];
/** "Welcome" in every UI language (used by the loading screen). */
export declare const WELCOME: Record<UiLanguage, string>;
export type UiText = Partial<Record<UiLanguage, Record<string, string>>>;
/** Words every YuktAI site uses. English is the fallback for any missing word. */
export declare const UI_TEXT: Record<UiLanguage, Record<string, string>>;
export declare const UI_LANGUAGE_KEY = "yuktai-ui-lang";
export declare function getUiLanguage(): UiLanguage;
export declare function setUiLanguage(lang: UiLanguage): void;
export declare function subscribeUiLanguage(onChange: () => void): () => void;
/** Look up one word: your text first, then UI_TEXT, then English, then the key itself. */
export declare function uiText(lang: UiLanguage, key: string, extra?: UiText): string;
/**
 * const { t, lang } = useUiText(MY_TEXT);
 * <nav lang={lang}>{t("docs")}</nav>
 * The server and the first render use English, so there is no hydration mismatch.
 */
export declare function useUiText(extra?: UiText): {
    t: (key: string) => string;
    lang: UiLanguage;
};
