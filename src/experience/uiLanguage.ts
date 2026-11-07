// ─────────────────────────────────────────────────────────────────────────────
// Site language for menus and buttons: English + 6 Indian languages.
// The visitor picks one; it is saved in this browser only. Add your own words
// with useUiText(yourText). Elements that show translated words get a matching
// lang attribute, so screen readers pronounce them correctly.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useSyncExternalStore } from "react";

export type UiLanguage = "en" | "te" | "hi" | "ta" | "kn" | "ml" | "bn";

export const UI_LANGUAGES: { code: UiLanguage; name: string; english: string }[] = [
  { code: "en", name: "English", english: "English" },
  { code: "te", name: "తెలుగు", english: "Telugu" },
  { code: "hi", name: "हिन्दी", english: "Hindi" },
  { code: "ta", name: "தமிழ்", english: "Tamil" },
  { code: "kn", name: "ಕನ್ನಡ", english: "Kannada" },
  { code: "ml", name: "മലയാളം", english: "Malayalam" },
  { code: "bn", name: "বাংলা", english: "Bengali" },
];

/** "Welcome" in every UI language (used by the loading screen). */
export const WELCOME: Record<UiLanguage, string> = {
  en: "Welcome",
  te: "స్వాగతం",
  hi: "स्वागत है",
  ta: "நல்வரவு",
  kn: "ಸ್ವಾಗತ",
  ml: "സ്വാഗതം",
  bn: "স্বাগতম",
};

export type UiText = Partial<Record<UiLanguage, Record<string, string>>>;

/** Words every YuktAI site uses. English is the fallback for any missing word. */
export const UI_TEXT: Record<UiLanguage, Record<string, string>> = {
  en: {
    home: "Home", docs: "Docs", about: "About", installApp: "Install app", askThisPage: "Ask this page…", ask: "Ask",
    backToTop: "Back to top", skip: "Skip to content", settings: "Language and animations", language: "Language",
    motion: "Animations", motionAuto: "Device setting", motionOff: "Off", motionCalm: "Calm", motionLively: "Lively",
    saved: "Saved in this browser only.", loading: "Loading", skipIntro: "Skip", darkTheme: "Dark theme", copy: "Copy", copied: "Copied",
    uiNote: "Menus and buttons change language. Guides stay in English for now.",
  },
  te: {
    home: "హోమ్", docs: "డాక్స్", about: "గురించి", installApp: "యాప్ ఇన్‌స్టాల్", askThisPage: "ఈ పేజీని అడగండి…", ask: "అడగండి",
    backToTop: "పైకి వెళ్ళండి", skip: "కంటెంట్‌కు వెళ్ళండి", settings: "భాష, యానిమేషన్లు", language: "భాష",
    motion: "యానిమేషన్లు", motionAuto: "పరికరం సెట్టింగ్", motionOff: "ఆఫ్", motionCalm: "నెమ్మదిగా", motionLively: "ఉత్సాహంగా",
    saved: "ఈ బ్రౌజర్‌లో మాత్రమే సేవ్ అవుతుంది.", loading: "లోడ్ అవుతోంది", skipIntro: "దాటవేయి", darkTheme: "డార్క్ థీమ్", copy: "కాపీ", copied: "కాపీ అయింది",
    uiNote: "మెనూలు, బటన్లు ఈ భాషలో మారతాయి. గైడ్‌లు ప్రస్తుతం ఇంగ్లీష్‌లోనే.",
  },
  hi: {
    home: "होम", docs: "डॉक्स", about: "परिचय", installApp: "ऐप इंस्टॉल करें", askThisPage: "इस पेज से पूछें…", ask: "पूछें",
    backToTop: "ऊपर जाएँ", skip: "सामग्री पर जाएँ", settings: "भाषा और एनिमेशन", language: "भाषा",
    motion: "एनिमेशन", motionAuto: "डिवाइस के अनुसार", motionOff: "बंद", motionCalm: "हल्के", motionLively: "जीवंत",
    saved: "केवल इसी ब्राउज़र में सहेजा जाता है।", loading: "लोड हो रहा है", skipIntro: "छोड़ें", darkTheme: "डार्क थीम", copy: "कॉपी", copied: "कॉपी हो गया",
    uiNote: "मेन्यू और बटन इस भाषा में बदलते हैं। गाइड अभी अंग्रेज़ी में हैं।",
  },
  ta: {
    home: "முகப்பு", docs: "ஆவணங்கள்", about: "பற்றி", installApp: "ஆப்பை நிறுவு", askThisPage: "இந்தப் பக்கத்திடம் கேளுங்கள்…", ask: "கேள்",
    backToTop: "மேலே செல்", skip: "உள்ளடக்கத்திற்குச் செல்", settings: "மொழி, அசைவூட்டங்கள்", language: "மொழி",
    motion: "அசைவூட்டங்கள்", motionAuto: "சாதன அமைப்பு", motionOff: "அணை", motionCalm: "மிதமான", motionLively: "உற்சாகமான",
    saved: "இந்த உலாவியில் மட்டும் சேமிக்கப்படும்.", loading: "ஏற்றுகிறது", skipIntro: "தவிர்", darkTheme: "இருண்ட தீம்", copy: "நகலெடு", copied: "நகலெடுத்தது",
    uiNote: "மெனுக்களும் பொத்தான்களும் இந்த மொழியில் மாறும். வழிகாட்டிகள் இப்போதைக்கு ஆங்கிலத்தில்.",
  },
  kn: {
    home: "ಮುಖಪುಟ", docs: "ದಾಖಲೆಗಳು", about: "ಕುರಿತು", installApp: "ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ", askThisPage: "ಈ ಪುಟವನ್ನು ಕೇಳಿ…", ask: "ಕೇಳಿ",
    backToTop: "ಮೇಲಕ್ಕೆ", skip: "ವಿಷಯಕ್ಕೆ ಹೋಗಿ", settings: "ಭಾಷೆ, ಅನಿಮೇಶನ್‌ಗಳು", language: "ಭಾಷೆ",
    motion: "ಅನಿಮೇಶನ್‌ಗಳು", motionAuto: "ಸಾಧನದ ಸೆಟ್ಟಿಂಗ್", motionOff: "ಆಫ್", motionCalm: "ಸೌಮ್ಯ", motionLively: "ಉತ್ಸಾಹಭರಿತ",
    saved: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಸಲಾಗುತ್ತದೆ.", loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ", skipIntro: "ಬಿಟ್ಟುಬಿಡಿ", darkTheme: "ಡಾರ್ಕ್ ಥೀಮ್", copy: "ನಕಲಿಸಿ", copied: "ನಕಲಿಸಲಾಗಿದೆ",
    uiNote: "ಮೆನು ಮತ್ತು ಬಟನ್‌ಗಳು ಈ ಭಾಷೆಗೆ ಬದಲಾಗುತ್ತವೆ. ಮಾರ್ಗದರ್ಶಿಗಳು ಸದ್ಯಕ್ಕೆ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ.",
  },
  ml: {
    home: "ഹോം", docs: "ഡോക്സ്", about: "വിവരം", installApp: "ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക", askThisPage: "ഈ പേജിനോട് ചോദിക്കൂ…", ask: "ചോദിക്കൂ",
    backToTop: "മുകളിലേക്ക്", skip: "ഉള്ളടക്കത്തിലേക്ക് പോകുക", settings: "ഭാഷ, ആനിമേഷനുകൾ", language: "ഭാഷ",
    motion: "ആനിമേഷനുകൾ", motionAuto: "ഉപകരണ ക്രമീകരണം", motionOff: "ഓഫ്", motionCalm: "ശാന്തം", motionLively: "സജീവം",
    saved: "ഈ ബ്രൗസറിൽ മാത്രം സൂക്ഷിക്കുന്നു.", loading: "ലോഡ് ചെയ്യുന്നു", skipIntro: "ഒഴിവാക്കുക", darkTheme: "ഡാർക്ക് തീം", copy: "പകർത്തുക", copied: "പകർത്തി",
    uiNote: "മെനുവും ബട്ടണുകളും ഈ ഭാഷയിലേക്ക് മാറും. ഗൈഡുകൾ ഇപ്പോൾ ഇംഗ്ലീഷിൽ.",
  },
  bn: {
    home: "হোম", docs: "ডক্স", about: "পরিচিতি", installApp: "অ্যাপ ইনস্টল করুন", askThisPage: "এই পেজকে জিজ্ঞেস করুন…", ask: "জিজ্ঞেস করুন",
    backToTop: "উপরে যান", skip: "বিষয়বস্তুতে যান", settings: "ভাষা ও অ্যানিমেশন", language: "ভাষা",
    motion: "অ্যানিমেশন", motionAuto: "ডিভাইসের সেটিং", motionOff: "বন্ধ", motionCalm: "হালকা", motionLively: "প্রাণবন্ত",
    saved: "শুধু এই ব্রাউজারে সংরক্ষিত থাকে।", loading: "লোড হচ্ছে", skipIntro: "এড়িয়ে যান", darkTheme: "ডার্ক থিম", copy: "কপি", copied: "কপি হয়েছে",
    uiNote: "মেনু ও বোতাম এই ভাষায় বদলায়। গাইড আপাতত ইংরেজিতে।",
  },
};

export const UI_LANGUAGE_KEY = "yuktai-ui-lang";
const EVENT = "yuktai:ui-lang";
const isUiLanguage = (v: unknown): v is UiLanguage => UI_LANGUAGES.some((l) => l.code === v);

export function getUiLanguage(): UiLanguage {
  try {
    const v = localStorage.getItem(UI_LANGUAGE_KEY);
    if (isUiLanguage(v)) return v;
  } catch {}
  return "en";
}

export function setUiLanguage(lang: UiLanguage) {
  try {
    if (lang === "en") localStorage.removeItem(UI_LANGUAGE_KEY);
    else localStorage.setItem(UI_LANGUAGE_KEY, lang);
  } catch {}
  document.documentElement.setAttribute("data-ui-lang", lang);
  document.dispatchEvent(new Event(EVENT));
}

export function subscribeUiLanguage(onChange: () => void) {
  const storage = (e: StorageEvent) => { if (e.key === UI_LANGUAGE_KEY) onChange(); };
  document.addEventListener(EVENT, onChange);
  window.addEventListener("storage", storage);
  return () => {
    document.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", storage);
  };
}

/** Look up one word: your text first, then UI_TEXT, then English, then the key itself. */
export function uiText(lang: UiLanguage, key: string, extra?: UiText): string {
  return extra?.[lang]?.[key] ?? UI_TEXT[lang]?.[key] ?? extra?.en?.[key] ?? UI_TEXT.en[key] ?? key;
}

/**
 * const { t, lang } = useUiText(MY_TEXT);
 * <nav lang={lang}>{t("docs")}</nav>
 * The server and the first render use English, so there is no hydration mismatch.
 */
export function useUiText(extra?: UiText) {
  const lang = useSyncExternalStore(subscribeUiLanguage, getUiLanguage, () => "en" as UiLanguage);
  const t = useCallback((key: string) => uiText(lang, key, extra), [lang, extra]);
  return { t, lang };
}
