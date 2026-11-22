// 22 భారతీయ భాషలు (8వ షెడ్యూల్) + English.
// ప్రతి భాషకు: స్థానిక పేరు, దిశ (Urdu, Kashmiri, Sindhi కుడి నుంచి ఎడమకు).
// UI మాటలు: 16 భాషల్లో సిద్ధం. మిగతా 7 భాషల్లో పేజీ content (మీ event.json) పూర్తిగా ఆ భాషలోనే ఉంటుంది;
// బటన్ల మాటలు మాత్రమే దగ్గరి భాషలో (fallback), ఆ భాష మాట్లాడేవారు సరిచూసే వరకు.

export const LANGUAGES = {
  en: { name: "English" },
  as: { name: "অসমীয়া" },
  bn: { name: "বাংলা" },
  brx: { name: "बड़ो", fallback: "hi" },
  doi: { name: "डोगरी", fallback: "hi" },
  gu: { name: "ગુજરાતી" },
  hi: { name: "हिन्दी" },
  kn: { name: "ಕನ್ನಡ" },
  ks: { name: "کٲشُر", dir: "rtl", fallback: "ur" },
  kok: { name: "कोंकणी" },
  mai: { name: "मैथिली", fallback: "hi" },
  ml: { name: "മലയാളം" },
  mni: { name: "ꯃꯤꯇꯩꯂꯣꯟ", fallback: "en" },
  mr: { name: "मराठी" },
  ne: { name: "नेपाली" },
  or: { name: "ଓଡ଼ିଆ" },
  pa: { name: "ਪੰਜਾਬੀ" },
  sa: { name: "संस्कृतम्" },
  sat: { name: "ᱥᱟᱱᱛᱟᱲᱤ", fallback: "en" },
  sd: { name: "سنڌي", dir: "rtl", fallback: "ur" },
  ta: { name: "தமிழ்" },
  te: { name: "తెలుగు" },
  ur: { name: "اردو", dir: "rtl" },
};

export const LANG_CODES = Object.keys(LANGUAGES);

const S = {};

S.en = {
  photos: "Photos",
  language: "Language", skip: "Skip to main content",
  countdownLabel: "Time left", days: "days", hours: "hours", minutes: "minutes", started: "The celebration has begun!",
  events: "Events", map: "Directions", addToCalendar: "Add to calendar", addAll: "Add all events to calendar",
  rituals: "About the rituals",
  rsvp: "Will you join us?", yourName: "Your name", guests: "Number of guests", attending: "I will attend",
  sendWhatsapp: "Send on WhatsApp", sendEmail: "Send by email",
  rsvpHello: "Namaste! RSVP for", rsvpFrom: "Name", rsvpGuests: "Guests", rsvpEvents: "Attending",
  needName: "Please enter your name.",
  album: "Share your photos", openAlbum: "Open the photo album",
  contacts: "Contact", call: "Call", whatsapp: "WhatsApp", email: "Email", website: "Website",
  saveContact: "Save contact", services: "Services", scan: "Scan to open this page",
  footer: "YuktAI Shubhalekha · Free and open source. Nothing you type here is stored by this site.",
  install: "Install as app", iosInstall: "To install: tap Share, then Add to Home Screen.",
  ask: "Ask", askTitle: "Ask us anything", askPlaceholder: "Type your question", askSend: "Ask",
  qWhen: "When is it?", qWhere: "Where is it?", qRsvp: "How do I RSVP?", qContact: "Whom can I call?",
  noAnswer: "We don't have that detail here. Please contact the family.", close: "Close",
};

S.te = {
  photos: "ఫోటోలు",
  language: "భాష", skip: "ముఖ్య భాగానికి వెళ్ళండి",
  countdownLabel: "ఇంకా మిగిలిన సమయం", days: "రోజులు", hours: "గంటలు", minutes: "నిమిషాలు", started: "వేడుక మొదలైంది!",
  events: "కార్యక్రమాలు", map: "దారి", addToCalendar: "Calendar లో చేర్చండి", addAll: "అన్ని కార్యక్రమాలూ calendar లో చేర్చండి",
  rituals: "సంప్రదాయాల గురించి",
  rsvp: "మీరు వస్తున్నారా?", yourName: "మీ పేరు", guests: "ఎంతమంది వస్తున్నారు", attending: "నేను హాజరవుతాను",
  sendWhatsapp: "WhatsApp లో పంపండి", sendEmail: "Email లో పంపండి",
  rsvpHello: "నమస్తే! హాజరు సమాచారం:", rsvpFrom: "పేరు", rsvpGuests: "అతిథులు", rsvpEvents: "హాజరయ్యే కార్యక్రమాలు",
  needName: "దయచేసి మీ పేరు రాయండి.",
  album: "మీ ఫోటోలు పంచుకోండి", openAlbum: "ఫోటో album తెరవండి",
  contacts: "సంప్రదించండి", call: "ఫోన్", saveContact: "Contact save చేయండి", services: "సేవలు",
  scan: "ఈ పేజీ తెరవడానికి scan చేయండి",
  footer: "YuktAI Shubhalekha · ఉచితం, open source. మీరు ఇక్కడ రాసేది ఈ site ఎక్కడా దాచదు.",
  install: "App లా install చేయండి", iosInstall: "Install చేయడానికి: Share నొక్కి, Add to Home Screen ఎంచుకోండి.",
  ask: "అడగండి", askTitle: "మమ్మల్ని ఏదైనా అడగండి", askPlaceholder: "మీ ప్రశ్న రాయండి", askSend: "అడుగు",
  qWhen: "ఎప్పుడు?", qWhere: "ఎక్కడ?", qRsvp: "హాజరు ఎలా తెలపాలి?", qContact: "ఎవరికి ఫోన్ చేయాలి?",
  noAnswer: "ఈ వివరం ఇక్కడ లేదు. దయచేసి కుటుంబ సభ్యులను సంప్రదించండి.", close: "మూసివేయండి",
};

S.hi = {
  photos: "तस्वीरें",
  language: "भाषा", skip: "मुख्य भाग पर जाएँ",
  countdownLabel: "बचा हुआ समय", days: "दिन", hours: "घंटे", minutes: "मिनट", started: "उत्सव शुरू हो गया है!",
  events: "कार्यक्रम", map: "रास्ता", addToCalendar: "कैलेंडर में जोड़ें", addAll: "सभी कार्यक्रम कैलेंडर में जोड़ें",
  rituals: "रस्मों के बारे में",
  rsvp: "क्या आप आएँगे?", yourName: "आपका नाम", guests: "मेहमानों की संख्या", attending: "मैं आऊँगा/आऊँगी",
  sendWhatsapp: "WhatsApp पर भेजें", sendEmail: "ईमेल से भेजें",
  rsvpHello: "नमस्ते! उपस्थिति की सूचना:", rsvpFrom: "नाम", rsvpGuests: "मेहमान", rsvpEvents: "कार्यक्रम",
  needName: "कृपया अपना नाम लिखें।",
  album: "अपनी तस्वीरें साझा करें", openAlbum: "फ़ोटो एल्बम खोलें",
  contacts: "संपर्क", call: "कॉल", email: "ईमेल", website: "वेबसाइट", saveContact: "संपर्क सेव करें", services: "सेवाएँ",
  scan: "यह पेज खोलने के लिए स्कैन करें",
  footer: "YuktAI Shubhalekha · मुफ़्त और ओपन सोर्स। आप यहाँ जो लिखते हैं, यह साइट कहीं नहीं रखती।",
  install: "ऐप की तरह इंस्टॉल करें", iosInstall: "इंस्टॉल करने के लिए: Share दबाएँ, फिर Add to Home Screen चुनें।",
  ask: "पूछें", askTitle: "हमसे कुछ भी पूछें", askPlaceholder: "अपना सवाल लिखें", askSend: "पूछें",
  qWhen: "कब है?", qWhere: "कहाँ है?", qRsvp: "उपस्थिति कैसे बताएँ?", qContact: "किसे फ़ोन करें?",
  noAnswer: "यह जानकारी यहाँ नहीं है। कृपया परिवार से संपर्क करें।", close: "बंद करें",
};

S.kn = {
  photos: "ಫೋಟೋಗಳು",
  language: "ಭಾಷೆ", skip: "ಮುಖ್ಯ ಭಾಗಕ್ಕೆ ಹೋಗಿ",
  countdownLabel: "ಉಳಿದ ಸಮಯ", days: "ದಿನಗಳು", hours: "ಗಂಟೆಗಳು", minutes: "ನಿಮಿಷಗಳು", started: "ಸಮಾರಂಭ ಆರಂಭವಾಗಿದೆ!",
  events: "ಕಾರ್ಯಕ್ರಮಗಳು", map: "ದಾರಿ", addToCalendar: "ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ", addAll: "ಎಲ್ಲಾ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ",
  rituals: "ಸಂಪ್ರದಾಯಗಳ ಬಗ್ಗೆ",
  rsvp: "ನೀವು ಬರುತ್ತೀರಾ?", yourName: "ನಿಮ್ಮ ಹೆಸರು", guests: "ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ", attending: "ನಾನು ಹಾಜರಾಗುತ್ತೇನೆ",
  sendWhatsapp: "WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ", sendEmail: "ಇಮೇಲ್ ಮೂಲಕ ಕಳುಹಿಸಿ",
  rsvpHello: "ನಮಸ್ತೆ! ಹಾಜರಾತಿ ಮಾಹಿತಿ:", rsvpFrom: "ಹೆಸರು", rsvpGuests: "ಅತಿಥಿಗಳು", rsvpEvents: "ಕಾರ್ಯಕ್ರಮಗಳು",
  needName: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು ಬರೆಯಿರಿ.",
  album: "ನಿಮ್ಮ ಫೋಟೋಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ", openAlbum: "ಫೋಟೋ ಆಲ್ಬಮ್ ತೆರೆಯಿರಿ",
  contacts: "ಸಂಪರ್ಕ", call: "ಕರೆ", email: "ಇಮೇಲ್", website: "ವೆಬ್‌ಸೈಟ್", saveContact: "ಸಂಪರ್ಕ ಉಳಿಸಿ", services: "ಸೇವೆಗಳು",
  scan: "ಈ ಪುಟ ತೆರೆಯಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
  footer: "YuktAI Shubhalekha · ಉಚಿತ ಮತ್ತು ಓಪನ್ ಸೋರ್ಸ್. ನೀವು ಇಲ್ಲಿ ಬರೆಯುವುದನ್ನು ಈ ಸೈಟ್ ಎಲ್ಲಿಯೂ ಇಡುವುದಿಲ್ಲ.",
  install: "ಆ್ಯಪ್‌ನಂತೆ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ", iosInstall: "ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲು: Share ಒತ್ತಿ, ನಂತರ Add to Home Screen ಆಯ್ಕೆಮಾಡಿ.",
  ask: "ಕೇಳಿ", askTitle: "ನಮ್ಮನ್ನು ಏನಾದರೂ ಕೇಳಿ", askPlaceholder: "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ", askSend: "ಕೇಳಿ",
  qWhen: "ಯಾವಾಗ?", qWhere: "ಎಲ್ಲಿ?", qRsvp: "ಹಾಜರಾತಿ ಹೇಗೆ ತಿಳಿಸುವುದು?", qContact: "ಯಾರಿಗೆ ಕರೆ ಮಾಡಬೇಕು?",
  noAnswer: "ಈ ವಿವರ ಇಲ್ಲಿ ಇಲ್ಲ. ದಯವಿಟ್ಟು ಕುಟುಂಬದವರನ್ನು ಸಂಪರ್ಕಿಸಿ.", close: "ಮುಚ್ಚಿ",
};

S.ta = {
  photos: "புகைப்படங்கள்",
  language: "மொழி", skip: "முக்கிய பகுதிக்குச் செல்லவும்",
  countdownLabel: "மீதமுள்ள நேரம்", days: "நாட்கள்", hours: "மணி", minutes: "நிமிடங்கள்", started: "விழா தொடங்கிவிட்டது!",
  events: "நிகழ்ச்சிகள்", map: "வழி", addToCalendar: "நாட்காட்டியில் சேர்க்கவும்", addAll: "எல்லா நிகழ்ச்சிகளையும் நாட்காட்டியில் சேர்க்கவும்",
  rituals: "சடங்குகள் பற்றி",
  rsvp: "நீங்கள் வருவீர்களா?", yourName: "உங்கள் பெயர்", guests: "விருந்தினர் எண்ணிக்கை", attending: "நான் கலந்துகொள்வேன்",
  sendWhatsapp: "WhatsApp-இல் அனுப்பவும்", sendEmail: "மின்னஞ்சலில் அனுப்பவும்",
  rsvpHello: "வணக்கம்! வருகை தகவல்:", rsvpFrom: "பெயர்", rsvpGuests: "விருந்தினர்", rsvpEvents: "நிகழ்ச்சிகள்",
  needName: "தயவுசெய்து உங்கள் பெயரை எழுதவும்.",
  album: "உங்கள் புகைப்படங்களைப் பகிருங்கள்", openAlbum: "புகைப்பட ஆல்பத்தைத் திறக்கவும்",
  contacts: "தொடர்புக்கு", call: "அழைக்க", email: "மின்னஞ்சல்", website: "இணையதளம்", saveContact: "தொடர்பைச் சேமிக்கவும்", services: "சேவைகள்",
  scan: "இந்தப் பக்கத்தைத் திறக்க ஸ்கேன் செய்யவும்",
  footer: "YuktAI Shubhalekha · இலவசம், திறந்த மூலம். நீங்கள் இங்கு எழுதுவதை இந்தத் தளம் எங்கும் சேமிக்காது.",
  install: "செயலியாக நிறுவவும்", iosInstall: "நிறுவ: Share அழுத்தி, Add to Home Screen தேர்வு செய்யவும்.",
  ask: "கேளுங்கள்", askTitle: "எங்களிடம் எதையும் கேளுங்கள்", askPlaceholder: "உங்கள் கேள்வியை எழுதவும்", askSend: "கேள்",
  qWhen: "எப்போது?", qWhere: "எங்கே?", qRsvp: "வருகையை எப்படித் தெரிவிப்பது?", qContact: "யாரை அழைக்க வேண்டும்?",
  noAnswer: "இந்தத் தகவல் இங்கு இல்லை. தயவுசெய்து குடும்பத்தினரைத் தொடர்பு கொள்ளவும்.", close: "மூடு",
};

S.ml = {
  photos: "ഫോട്ടോകൾ",
  language: "ഭാഷ", skip: "പ്രധാന ഭാഗത്തേക്ക് പോകുക",
  countdownLabel: "ബാക്കിയുള്ള സമയം", days: "ദിവസം", hours: "മണിക്കൂർ", minutes: "മിനിറ്റ്", started: "ചടങ്ങ് ആരംഭിച്ചു!",
  events: "പരിപാടികൾ", map: "വഴി", addToCalendar: "കലണ്ടറിൽ ചേർക്കുക", addAll: "എല്ലാ പരിപാടികളും കലണ്ടറിൽ ചേർക്കുക",
  rituals: "ചടങ്ങുകളെക്കുറിച്ച്",
  rsvp: "നിങ്ങൾ വരുമോ?", yourName: "നിങ്ങളുടെ പേര്", guests: "അതിഥികളുടെ എണ്ണം", attending: "ഞാൻ പങ്കെടുക്കും",
  sendWhatsapp: "WhatsApp-ൽ അയയ്ക്കുക", sendEmail: "ഇമെയിലായി അയയ്ക്കുക",
  rsvpHello: "നമസ്കാരം! പങ്കെടുക്കൽ വിവരം:", rsvpFrom: "പേര്", rsvpGuests: "അതിഥികൾ", rsvpEvents: "പരിപാടികൾ",
  needName: "ദയവായി നിങ്ങളുടെ പേര് എഴുതുക.",
  album: "നിങ്ങളുടെ ഫോട്ടോകൾ പങ്കിടുക", openAlbum: "ഫോട്ടോ ആൽബം തുറക്കുക",
  contacts: "ബന്ധപ്പെടുക", call: "വിളിക്കുക", email: "ഇമെയിൽ", website: "വെബ്സൈറ്റ്", saveContact: "കോൺടാക്റ്റ് സേവ് ചെയ്യുക", services: "സേവനങ്ങൾ",
  scan: "ഈ പേജ് തുറക്കാൻ സ്കാൻ ചെയ്യുക",
  footer: "YuktAI Shubhalekha · സൗജന്യം, ഓപ്പൺ സോഴ്സ്. നിങ്ങൾ ഇവിടെ എഴുതുന്നത് ഈ സൈറ്റ് എവിടെയും സൂക്ഷിക്കുന്നില്ല.",
  install: "ആപ്പായി ഇൻസ്റ്റാൾ ചെയ്യുക", iosInstall: "ഇൻസ്റ്റാൾ ചെയ്യാൻ: Share അമർത്തി Add to Home Screen തിരഞ്ഞെടുക്കുക.",
  ask: "ചോദിക്കുക", askTitle: "ഞങ്ങളോട് എന്തും ചോദിക്കൂ", askPlaceholder: "നിങ്ങളുടെ ചോദ്യം എഴുതുക", askSend: "ചോദിക്കുക",
  qWhen: "എപ്പോൾ?", qWhere: "എവിടെ?", qRsvp: "പങ്കെടുക്കൽ എങ്ങനെ അറിയിക്കാം?", qContact: "ആരെ വിളിക്കണം?",
  noAnswer: "ഈ വിവരം ഇവിടെയില്ല. ദയവായി കുടുംബത്തെ ബന്ധപ്പെടുക.", close: "അടയ്ക്കുക",
};

S.mr = {
  photos: "फोटो",
  language: "भाषा", skip: "मुख्य भागाकडे जा",
  countdownLabel: "उरलेला वेळ", days: "दिवस", hours: "तास", minutes: "मिनिटे", started: "सोहळा सुरू झाला आहे!",
  events: "कार्यक्रम", map: "रस्ता", addToCalendar: "कॅलेंडरमध्ये जोडा", addAll: "सर्व कार्यक्रम कॅलेंडरमध्ये जोडा",
  rituals: "विधींबद्दल",
  rsvp: "तुम्ही येणार का?", yourName: "तुमचे नाव", guests: "पाहुण्यांची संख्या", attending: "मी उपस्थित राहीन",
  sendWhatsapp: "WhatsApp वर पाठवा", sendEmail: "ईमेलने पाठवा",
  rsvpHello: "नमस्कार! उपस्थितीची माहिती:", rsvpFrom: "नाव", rsvpGuests: "पाहुणे", rsvpEvents: "कार्यक्रम",
  needName: "कृपया तुमचे नाव लिहा.",
  album: "तुमचे फोटो शेअर करा", openAlbum: "फोटो अल्बम उघडा",
  contacts: "संपर्क", call: "कॉल", email: "ईमेल", website: "वेबसाइट", saveContact: "संपर्क सेव्ह करा", services: "सेवा",
  scan: "हे पान उघडण्यासाठी स्कॅन करा",
  footer: "YuktAI Shubhalekha · मोफत आणि ओपन सोर्स. तुम्ही इथे जे लिहिता ते ही साइट कुठेही साठवत नाही.",
  install: "अ‍ॅप म्हणून इन्स्टॉल करा", iosInstall: "इन्स्टॉल करण्यासाठी: Share दाबा, मग Add to Home Screen निवडा.",
  ask: "विचारा", askTitle: "आम्हाला काहीही विचारा", askPlaceholder: "तुमचा प्रश्न लिहा", askSend: "विचारा",
  qWhen: "कधी आहे?", qWhere: "कुठे आहे?", qRsvp: "उपस्थिती कशी कळवायची?", qContact: "कोणाला फोन करायचा?",
  noAnswer: "ही माहिती इथे नाही. कृपया कुटुंबाशी संपर्क साधा.", close: "बंद करा",
};

S.bn = {
  photos: "ছবি",
  language: "ভাষা", skip: "মূল অংশে যান",
  countdownLabel: "বাকি সময়", days: "দিন", hours: "ঘণ্টা", minutes: "মিনিট", started: "অনুষ্ঠান শুরু হয়ে গেছে!",
  events: "অনুষ্ঠানসূচি", map: "পথনির্দেশ", addToCalendar: "ক্যালেন্ডারে যোগ করুন", addAll: "সব অনুষ্ঠান ক্যালেন্ডারে যোগ করুন",
  rituals: "আচার-অনুষ্ঠান সম্পর্কে",
  rsvp: "আপনি কি আসছেন?", yourName: "আপনার নাম", guests: "অতিথির সংখ্যা", attending: "আমি উপস্থিত থাকব",
  sendWhatsapp: "WhatsApp-এ পাঠান", sendEmail: "ইমেলে পাঠান",
  rsvpHello: "নমস্কার! উপস্থিতির তথ্য:", rsvpFrom: "নাম", rsvpGuests: "অতিথি", rsvpEvents: "অনুষ্ঠান",
  needName: "অনুগ্রহ করে আপনার নাম লিখুন।",
  album: "আপনার ছবি শেয়ার করুন", openAlbum: "ছবির অ্যালবাম খুলুন",
  contacts: "যোগাযোগ", call: "কল করুন", email: "ইমেল", website: "ওয়েবসাইট", saveContact: "পরিচিতি সংরক্ষণ করুন", services: "পরিষেবা",
  scan: "এই পাতা খুলতে স্ক্যান করুন",
  footer: "YuktAI Shubhalekha · বিনামূল্যে ও ওপেন সোর্স। আপনি এখানে যা লেখেন, এই সাইট তা কোথাও রাখে না।",
  install: "অ্যাপ হিসেবে ইনস্টল করুন", iosInstall: "ইনস্টল করতে: Share চাপুন, তারপর Add to Home Screen বেছে নিন।",
  ask: "জিজ্ঞাসা করুন", askTitle: "আমাদের যা খুশি জিজ্ঞাসা করুন", askPlaceholder: "আপনার প্রশ্ন লিখুন", askSend: "জিজ্ঞাসা",
  qWhen: "কবে?", qWhere: "কোথায়?", qRsvp: "উপস্থিতি কীভাবে জানাব?", qContact: "কাকে ফোন করব?",
  noAnswer: "এই তথ্য এখানে নেই। অনুগ্রহ করে পরিবারের সঙ্গে যোগাযোগ করুন।", close: "বন্ধ করুন",
};

S.as = {
  photos: "ফটো",
  language: "ভাষা", skip: "মূল অংশলৈ যাওক",
  countdownLabel: "বাকী থকা সময়", days: "দিন", hours: "ঘণ্টা", minutes: "মিনিট", started: "উৎসৱ আৰম্ভ হৈছে!",
  events: "অনুষ্ঠানসূচী", map: "বাট", addToCalendar: "কেলেণ্ডাৰত যোগ কৰক", addAll: "সকলো অনুষ্ঠান কেলেণ্ডাৰত যোগ কৰক",
  rituals: "নীতি-নিয়মৰ বিষয়ে",
  rsvp: "আপুনি আহিব নেকি?", yourName: "আপোনাৰ নাম", guests: "অতিথিৰ সংখ্যা", attending: "মই উপস্থিত থাকিম",
  sendWhatsapp: "WhatsApp-ত পঠিয়াওক", sendEmail: "ইমেইলত পঠিয়াওক",
  rsvpHello: "নমস্কাৰ! উপস্থিতিৰ তথ্য:", rsvpFrom: "নাম", rsvpGuests: "অতিথি", rsvpEvents: "অনুষ্ঠান",
  needName: "অনুগ্ৰহ কৰি আপোনাৰ নাম লিখক।",
  album: "আপোনাৰ ফটো শ্বেয়াৰ কৰক", openAlbum: "ফটো এলবাম খোলক",
  contacts: "যোগাযোগ", call: "ফোন কৰক", email: "ইমেইল", website: "ৱেবছাইট", saveContact: "সম্পৰ্ক সংৰক্ষণ কৰক", services: "সেৱাসমূহ",
  scan: "এই পৃষ্ঠা খুলিবলৈ স্কেন কৰক",
  footer: "YuktAI Shubhalekha · বিনামূলীয়া আৰু মুক্ত উৎস। আপুনি ইয়াত যি লিখে, এই ছাইটে কতো নাৰাখে।",
  install: "এপ হিচাপে ইনষ্টল কৰক", iosInstall: "ইনষ্টল কৰিবলৈ: Share টিপক, তাৰ পিছত Add to Home Screen বাছক।",
  ask: "সোধক", askTitle: "আমাক যিকোনো কথা সোধক", askPlaceholder: "আপোনাৰ প্ৰশ্ন লিখক", askSend: "সোধক",
  qWhen: "কেতিয়া?", qWhere: "ক'ত?", qRsvp: "উপস্থিতি কেনেকৈ জনাম?", qContact: "কাক ফোন কৰিম?",
  noAnswer: "এই তথ্য ইয়াত নাই। অনুগ্ৰহ কৰি পৰিয়ালৰ সৈতে যোগাযোগ কৰক।", close: "বন্ধ কৰক",
};

S.gu = {
  photos: "ફોટા",
  language: "ભાષા", skip: "મુખ્ય ભાગ પર જાઓ",
  countdownLabel: "બાકી સમય", days: "દિવસ", hours: "કલાક", minutes: "મિનિટ", started: "ઉત્સવ શરૂ થઈ ગયો છે!",
  events: "કાર્યક્રમો", map: "રસ્તો", addToCalendar: "કૅલેન્ડરમાં ઉમેરો", addAll: "બધા કાર્યક્રમો કૅલેન્ડરમાં ઉમેરો",
  rituals: "વિધિઓ વિશે",
  rsvp: "શું તમે આવશો?", yourName: "તમારું નામ", guests: "મહેમાનોની સંખ્યા", attending: "હું હાજર રહીશ",
  sendWhatsapp: "WhatsApp પર મોકલો", sendEmail: "ઇમેઇલથી મોકલો",
  rsvpHello: "નમસ્તે! હાજરીની માહિતી:", rsvpFrom: "નામ", rsvpGuests: "મહેમાનો", rsvpEvents: "કાર્યક્રમો",
  needName: "કૃપા કરીને તમારું નામ લખો.",
  album: "તમારા ફોટા શેર કરો", openAlbum: "ફોટો આલ્બમ ખોલો",
  contacts: "સંપર્ક", call: "કૉલ કરો", email: "ઇમેઇલ", website: "વેબસાઇટ", saveContact: "સંપર્ક સાચવો", services: "સેવાઓ",
  scan: "આ પાનું ખોલવા સ્કૅન કરો",
  footer: "YuktAI Shubhalekha · મફત અને ઓપન સોર્સ. તમે અહીં જે લખો છો તે આ સાઇટ ક્યાંય સાચવતી નથી.",
  install: "ઍપ તરીકે ઇન્સ્ટૉલ કરો", iosInstall: "ઇન્સ્ટૉલ કરવા: Share દબાવો, પછી Add to Home Screen પસંદ કરો.",
  ask: "પૂછો", askTitle: "અમને કંઈ પણ પૂછો", askPlaceholder: "તમારો પ્રશ્ન લખો", askSend: "પૂછો",
  qWhen: "ક્યારે છે?", qWhere: "ક્યાં છે?", qRsvp: "હાજરી કેવી રીતે જણાવવી?", qContact: "કોને ફોન કરવો?",
  noAnswer: "આ માહિતી અહીં નથી. કૃપા કરીને પરિવારનો સંપર્ક કરો.", close: "બંધ કરો",
};

S.pa = {
  photos: "ਫੋਟੋਆਂ",
  language: "ਭਾਸ਼ਾ", skip: "ਮੁੱਖ ਹਿੱਸੇ ਵੱਲ ਜਾਓ",
  countdownLabel: "ਬਾਕੀ ਸਮਾਂ", days: "ਦਿਨ", hours: "ਘੰਟੇ", minutes: "ਮਿੰਟ", started: "ਸਮਾਗਮ ਸ਼ੁਰੂ ਹੋ ਗਿਆ ਹੈ!",
  events: "ਸਮਾਗਮ", map: "ਰਸਤਾ", addToCalendar: "ਕੈਲੰਡਰ ਵਿੱਚ ਜੋੜੋ", addAll: "ਸਾਰੇ ਸਮਾਗਮ ਕੈਲੰਡਰ ਵਿੱਚ ਜੋੜੋ",
  rituals: "ਰਸਮਾਂ ਬਾਰੇ",
  rsvp: "ਕੀ ਤੁਸੀਂ ਆਓਗੇ?", yourName: "ਤੁਹਾਡਾ ਨਾਮ", guests: "ਮਹਿਮਾਨਾਂ ਦੀ ਗਿਣਤੀ", attending: "ਮੈਂ ਹਾਜ਼ਰ ਹੋਵਾਂਗਾ/ਹੋਵਾਂਗੀ",
  sendWhatsapp: "WhatsApp 'ਤੇ ਭੇਜੋ", sendEmail: "ਈਮੇਲ ਰਾਹੀਂ ਭੇਜੋ",
  rsvpHello: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਹਾਜ਼ਰੀ ਦੀ ਜਾਣਕਾਰੀ:", rsvpFrom: "ਨਾਮ", rsvpGuests: "ਮਹਿਮਾਨ", rsvpEvents: "ਸਮਾਗਮ",
  needName: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਲਿਖੋ।",
  album: "ਆਪਣੀਆਂ ਫੋਟੋਆਂ ਸਾਂਝੀਆਂ ਕਰੋ", openAlbum: "ਫੋਟੋ ਐਲਬਮ ਖੋਲ੍ਹੋ",
  contacts: "ਸੰਪਰਕ", call: "ਕਾਲ ਕਰੋ", email: "ਈਮੇਲ", website: "ਵੈੱਬਸਾਈਟ", saveContact: "ਸੰਪਰਕ ਸੰਭਾਲੋ", services: "ਸੇਵਾਵਾਂ",
  scan: "ਇਹ ਪੰਨਾ ਖੋਲ੍ਹਣ ਲਈ ਸਕੈਨ ਕਰੋ",
  footer: "YuktAI Shubhalekha · ਮੁਫ਼ਤ ਅਤੇ ਓਪਨ ਸੋਰਸ। ਤੁਸੀਂ ਇੱਥੇ ਜੋ ਲਿਖਦੇ ਹੋ, ਇਹ ਸਾਈਟ ਕਿਤੇ ਨਹੀਂ ਰੱਖਦੀ।",
  install: "ਐਪ ਵਾਂਗ ਇੰਸਟਾਲ ਕਰੋ", iosInstall: "ਇੰਸਟਾਲ ਕਰਨ ਲਈ: Share ਦਬਾਓ, ਫਿਰ Add to Home Screen ਚੁਣੋ।",
  ask: "ਪੁੱਛੋ", askTitle: "ਸਾਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ", askPlaceholder: "ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ", askSend: "ਪੁੱਛੋ",
  qWhen: "ਕਦੋਂ ਹੈ?", qWhere: "ਕਿੱਥੇ ਹੈ?", qRsvp: "ਹਾਜ਼ਰੀ ਕਿਵੇਂ ਦੱਸਾਂ?", qContact: "ਕਿਸ ਨੂੰ ਫ਼ੋਨ ਕਰਾਂ?",
  noAnswer: "ਇਹ ਜਾਣਕਾਰੀ ਇੱਥੇ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਪਰਿਵਾਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।", close: "ਬੰਦ ਕਰੋ",
};

S.or = {
  photos: "ଫଟୋ",
  language: "ଭାଷା", skip: "ମୁଖ୍ୟ ଅଂଶକୁ ଯାଆନ୍ତୁ",
  countdownLabel: "ବାକି ସମୟ", days: "ଦିନ", hours: "ଘଣ୍ଟା", minutes: "ମିନିଟ୍", started: "ଉତ୍ସବ ଆରମ୍ଭ ହୋଇଗଲାଣି!",
  events: "କାର୍ଯ୍ୟକ୍ରମ", map: "ରାସ୍ତା", addToCalendar: "କ୍ୟାଲେଣ୍ଡରରେ ଯୋଡ଼ନ୍ତୁ", addAll: "ସମସ୍ତ କାର୍ଯ୍ୟକ୍ରମ କ୍ୟାଲେଣ୍ଡରରେ ଯୋଡ଼ନ୍ତୁ",
  rituals: "ରୀତିନୀତି ବିଷୟରେ",
  rsvp: "ଆପଣ ଆସିବେ କି?", yourName: "ଆପଣଙ୍କ ନାମ", guests: "ଅତିଥି ସଂଖ୍ୟା", attending: "ମୁଁ ଉପସ୍ଥିତ ରହିବି",
  sendWhatsapp: "WhatsApp ରେ ପଠାନ୍ତୁ", sendEmail: "ଇମେଲରେ ପଠାନ୍ତୁ",
  rsvpHello: "ନମସ୍କାର! ଉପସ୍ଥିତି ସୂଚନା:", rsvpFrom: "ନାମ", rsvpGuests: "ଅତିଥି", rsvpEvents: "କାର୍ଯ୍ୟକ୍ରମ",
  needName: "ଦୟାକରି ଆପଣଙ୍କ ନାମ ଲେଖନ୍ତୁ।",
  album: "ଆପଣଙ୍କ ଫଟୋ ସେୟାର କରନ୍ତୁ", openAlbum: "ଫଟୋ ଆଲବମ୍ ଖୋଲନ୍ତୁ",
  contacts: "ଯୋଗାଯୋଗ", call: "କଲ୍ କରନ୍ତୁ", email: "ଇମେଲ", website: "ୱେବସାଇଟ୍", saveContact: "ଯୋଗାଯୋଗ ସେଭ୍ କରନ୍ତୁ", services: "ସେବା",
  scan: "ଏହି ପୃଷ୍ଠା ଖୋଲିବାକୁ ସ୍କାନ୍ କରନ୍ତୁ",
  footer: "YuktAI Shubhalekha · ମାଗଣା ଓ ଓପନ୍ ସୋର୍ସ। ଆପଣ ଏଠାରେ ଯାହା ଲେଖନ୍ତି, ଏହି ସାଇଟ୍ କେଉଁଠି ରଖେ ନାହିଁ।",
  install: "ଆପ୍ ଭାବେ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ", iosInstall: "ଇନଷ୍ଟଲ୍ ପାଇଁ: Share ଦବାନ୍ତୁ, ତାପରେ Add to Home Screen ବାଛନ୍ତୁ।",
  ask: "ପଚାରନ୍ତୁ", askTitle: "ଆମକୁ କିଛି ବି ପଚାରନ୍ତୁ", askPlaceholder: "ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ", askSend: "ପଚାରନ୍ତୁ",
  qWhen: "କେବେ?", qWhere: "କେଉଁଠି?", qRsvp: "ଉପସ୍ଥିତି କିପରି ଜଣାଇବି?", qContact: "କାହାକୁ ଫୋନ୍ କରିବି?",
  noAnswer: "ଏହି ସୂଚନା ଏଠାରେ ନାହିଁ। ଦୟାକରି ପରିବାର ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।", close: "ବନ୍ଦ କରନ୍ତୁ",
};

S.ur = {
  photos: "تصاویر",
  language: "زبان", skip: "مرکزی حصے پر جائیں",
  countdownLabel: "باقی وقت", days: "دن", hours: "گھنٹے", minutes: "منٹ", started: "تقریب شروع ہو چکی ہے!",
  events: "تقریبات", map: "راستہ", addToCalendar: "کیلنڈر میں شامل کریں", addAll: "تمام تقریبات کیلنڈر میں شامل کریں",
  rituals: "رسومات کے بارے میں",
  rsvp: "کیا آپ تشریف لائیں گے؟", yourName: "آپ کا نام", guests: "مہمانوں کی تعداد", attending: "میں شرکت کروں گا/گی",
  sendWhatsapp: "WhatsApp پر بھیجیں", sendEmail: "ای میل سے بھیجیں",
  rsvpHello: "آداب! حاضری کی اطلاع:", rsvpFrom: "نام", rsvpGuests: "مہمان", rsvpEvents: "تقریبات",
  needName: "براہ کرم اپنا نام لکھیں۔",
  album: "اپنی تصویریں شیئر کریں", openAlbum: "فوٹو البم کھولیں",
  contacts: "رابطہ", call: "کال کریں", email: "ای میل", website: "ویب سائٹ", saveContact: "رابطہ محفوظ کریں", services: "خدمات",
  scan: "یہ صفحہ کھولنے کے لیے اسکین کریں",
  footer: "YuktAI Shubhalekha · مفت اور اوپن سورس۔ آپ یہاں جو لکھتے ہیں، یہ سائٹ کہیں محفوظ نہیں کرتی۔",
  install: "ایپ کی طرح انسٹال کریں", iosInstall: "انسٹال کرنے کے لیے: Share دبائیں، پھر Add to Home Screen منتخب کریں۔",
  ask: "پوچھیں", askTitle: "ہم سے کچھ بھی پوچھیں", askPlaceholder: "اپنا سوال لکھیں", askSend: "پوچھیں",
  qWhen: "کب ہے؟", qWhere: "کہاں ہے؟", qRsvp: "حاضری کیسے بتائیں؟", qContact: "کسے فون کریں؟",
  noAnswer: "یہ معلومات یہاں موجود نہیں۔ براہ کرم خاندان سے رابطہ کریں۔", close: "بند کریں",
};

S.ne = {
  photos: "तस्बिरहरू",
  language: "भाषा", skip: "मुख्य भागमा जानुहोस्",
  countdownLabel: "बाँकी समय", days: "दिन", hours: "घण्टा", minutes: "मिनेट", started: "उत्सव सुरु भइसक्यो!",
  events: "कार्यक्रमहरू", map: "बाटो", addToCalendar: "क्यालेन्डरमा थप्नुहोस्", addAll: "सबै कार्यक्रम क्यालेन्डरमा थप्नुहोस्",
  rituals: "रीतिरिवाजबारे",
  rsvp: "के तपाईं आउनुहुन्छ?", yourName: "तपाईंको नाम", guests: "पाहुनाको संख्या", attending: "म उपस्थित हुनेछु",
  sendWhatsapp: "WhatsApp मा पठाउनुहोस्", sendEmail: "इमेलबाट पठाउनुहोस्",
  rsvpHello: "नमस्ते! उपस्थितिको जानकारी:", rsvpFrom: "नाम", rsvpGuests: "पाहुना", rsvpEvents: "कार्यक्रम",
  needName: "कृपया आफ्नो नाम लेख्नुहोस्।",
  album: "आफ्ना फोटो साझा गर्नुहोस्", openAlbum: "फोटो एल्बम खोल्नुहोस्",
  contacts: "सम्पर्क", call: "फोन गर्नुहोस्", email: "इमेल", website: "वेबसाइट", saveContact: "सम्पर्क सेभ गर्नुहोस्", services: "सेवाहरू",
  scan: "यो पृष्ठ खोल्न स्क्यान गर्नुहोस्",
  footer: "YuktAI Shubhalekha · निःशुल्क र खुला स्रोत। तपाईंले यहाँ लेखेको कुरा यो साइटले कतै राख्दैन।",
  install: "एपजस्तै इन्स्टल गर्नुहोस्", iosInstall: "इन्स्टल गर्न: Share थिच्नुहोस्, अनि Add to Home Screen छान्नुहोस्।",
  ask: "सोध्नुहोस्", askTitle: "हामीलाई जे पनि सोध्नुहोस्", askPlaceholder: "आफ्नो प्रश्न लेख्नुहोस्", askSend: "सोध्नुहोस्",
  qWhen: "कहिले?", qWhere: "कहाँ?", qRsvp: "उपस्थिति कसरी जनाउने?", qContact: "कसलाई फोन गर्ने?",
  noAnswer: "यो जानकारी यहाँ छैन। कृपया परिवारलाई सम्पर्क गर्नुहोस्।", close: "बन्द गर्नुहोस्",
};

S.sa = {
  photos: "चित्राणि",
  language: "भाषा", skip: "मुख्यभागं गच्छतु",
  countdownLabel: "अवशिष्टः कालः", days: "दिनानि", hours: "होराः", minutes: "निमेषाः", started: "उत्सवः आरब्धः!",
  events: "कार्यक्रमाः", map: "मार्गः", addToCalendar: "दिनदर्शिकायां योजयतु", addAll: "सर्वान् कार्यक्रमान् दिनदर्शिकायां योजयतु",
  rituals: "संस्काराणां विषये",
  rsvp: "भवान् आगमिष्यति वा?", yourName: "भवतः नाम", guests: "अतिथीनां सङ्ख्या", attending: "अहम् उपस्थितः भविष्यामि",
  sendWhatsapp: "WhatsApp द्वारा प्रेषयतु", sendEmail: "ईमेल् द्वारा प्रेषयतु",
  rsvpHello: "नमस्ते! उपस्थितिसूचना:", rsvpFrom: "नाम", rsvpGuests: "अतिथयः", rsvpEvents: "कार्यक्रमाः",
  needName: "कृपया स्वनाम लिखतु।",
  album: "स्वचित्राणि विभजतु", openAlbum: "चित्रसङ्ग्रहम् उद्घाटयतु",
  contacts: "सम्पर्कः", call: "दूरभाषः", saveContact: "सम्पर्कं रक्षतु", services: "सेवाः",
  scan: "इदं पृष्ठम् उद्घाटयितुं स्कैन् करोतु",
  footer: "YuktAI Shubhalekha · निःशुल्कं मुक्तस्रोतश्च। भवान् अत्र यत् लिखति तत् इदं जालस्थानं कुत्रापि न रक्षति।",
  install: "अनुप्रयोगरूपेण स्थापयतु", iosInstall: "स्थापनाय: Share नुदतु, ततः Add to Home Screen चिनोतु।",
  ask: "पृच्छतु", askTitle: "अस्मान् किमपि पृच्छतु", askPlaceholder: "स्वप्रश्नं लिखतु", askSend: "पृच्छतु",
  qWhen: "कदा?", qWhere: "कुत्र?", qRsvp: "उपस्थितिः कथं सूचनीया?", qContact: "कं दूरभाषेण सम्पर्कयेयम्?",
  noAnswer: "एषा सूचना अत्र नास्ति। कृपया कुटुम्बेन सह सम्पर्कं करोतु।", close: "पिदधातु",
};

S.kok = {
  photos: "फोटो",
  language: "भास", skip: "मुखेल भागाक वचात",
  countdownLabel: "उरिल्लो वेळ", days: "दीस", hours: "वरां", minutes: "मिनटां", started: "उत्सव सुरू जाला!",
  events: "कार्यावळ", map: "वाट", addToCalendar: "कॅलेंडरांत जोडात", addAll: "सगळे कार्यावळ कॅलेंडरांत जोडात",
  rituals: "विधींविशीं",
  rsvp: "तुमी येतले?", yourName: "तुमचें नांव", guests: "सोयऱ्यांची संख्या", attending: "हांव हाजीर उरतलों/उरतलें",
  sendWhatsapp: "WhatsApp चेर धाडात", sendEmail: "ईमेलान धाडात",
  rsvpHello: "नमस्कार! हाजीरीची म्हायती:", rsvpFrom: "नांव", rsvpGuests: "सोयरे", rsvpEvents: "कार्यावळ",
  needName: "उपकार करून तुमचें नांव बरयात.",
  album: "तुमचे फोटो वांटून घेयात", openAlbum: "फोटो आल्बम उगडात",
  contacts: "संपर्क", call: "फोन करात", saveContact: "संपर्क सांबाळात", services: "सेवा",
  scan: "हें पान उगडपाक स्कॅन करात",
  footer: "YuktAI Shubhalekha · फुकट आनी ओपन सोर्स. तुमी हांगा जें बरयतात, तें ही सायट खंयच दवरिना.",
  install: "ॲप म्हूण इन्स्टॉल करात", iosInstall: "इन्स्टॉल करपाक: Share दाबात, मागीर Add to Home Screen वेंचात.",
  ask: "विचारात", askTitle: "आमकां कितेंय विचारात", askPlaceholder: "तुमचो प्रस्न बरयात", askSend: "विचारात",
  qWhen: "केन्ना?", qWhere: "खंय?", qRsvp: "हाजीरी कशी कळोवची?", qContact: "कोणाक फोन करचो?",
  noAnswer: "ही म्हायती हांगा ना. उपकार करून कुटुंबाक संपर्क करात.", close: "बंद करात",
};

/** ఒక భాషకు UI మాటల జాబితా: లేని మాట దగ్గరి భాష నుంచి, చివరికి English నుంచి */
export function strings(lang) {
  const chain = [lang, LANGUAGES[lang]?.fallback, "en"].filter(Boolean);
  const out = {};
  for (const key of Object.keys(S.en)) {
    for (const l of chain) {
      if (S[l]?.[key]) {
        out[key] = S[l][key];
        break;
      }
    }
  }
  return out;
}

/** ఏ భాషల UI పూర్తిగా సిద్ధం, ఏవి దగ్గరి భాషపై ఆధారపడతాయి */
export const UI_READY = Object.keys(S);
