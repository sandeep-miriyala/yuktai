import type { UiText } from "@yuktishaalaa/yuktai/experience";

// This app's own words in the 7 site languages (English + Telugu, Hindi, Tamil,
// Kannada, Malayalam, Bengali). Common words (Home, About, Install app, Ask this
// page, Back to top…) come from the library. English is used for anything missing.
// Add a word here, then use it with: const { t } = useUiText(APP_TEXT); t("myWord")
export const APP_TEXT: UiText = {
  en: { grid: "Data grid", qa: "QA report", icons: "Icons", backend: "Backend" },
  te: { grid: "డేటా గ్రిడ్", qa: "QA రిపోర్ట్", icons: "ఐకాన్లు", backend: "బ్యాక్‌ఎండ్" },
  hi: { grid: "डेटा ग्रिड", qa: "QA रिपोर्ट", icons: "आइकन", backend: "बैकएंड" },
  ta: { grid: "தரவு கட்டம்", qa: "QA அறிக்கை", icons: "ஐகான்கள்", backend: "பின்தளம்" },
  kn: { grid: "ಡೇಟಾ ಗ್ರಿಡ್", qa: "QA ವರದಿ", icons: "ಐಕಾನ್‌ಗಳು", backend: "ಬ್ಯಾಕೆಂಡ್" },
  ml: { grid: "ഡാറ്റ ഗ്രിഡ്", qa: "QA റിപ്പോർട്ട്", icons: "ഐക്കണുകൾ", backend: "ബാക്കെൻഡ്" },
  bn: { grid: "ডেটা গ্রিড", qa: "QA রিপোর্ট", icons: "আইকন", backend: "ব্যাকএন্ড" },
};
