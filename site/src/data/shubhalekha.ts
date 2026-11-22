// శుభలేఖ తయారీ పేజీ data. FONTS, SCRIPT_OF ను packages/shubhalekha/src/fonts.js తో ఒకేలా ఉంచండి
// (site tests రెండూ సరిపోలుతున్నాయో చూస్తాయి).

// Netlify లోని Shubhalekha Maker సేవ. పేరు మారితే NEXT_PUBLIC_SHUBHALEKHA_API ఇవ్వండి.
export const MAKER_API = process.env.NEXT_PUBLIC_SHUBHALEKHA_API || "https://shubhalekha-maker.netlify.app/api";

export const LANGS: { code: string; name: string; rtl?: boolean }[] = [{"code":"te","name":"తెలుగు"},{"code":"en","name":"English"},{"code":"hi","name":"हिन्दी"},{"code":"ta","name":"தமிழ்"},{"code":"kn","name":"ಕನ್ನಡ"},{"code":"ml","name":"മലയാളം"},{"code":"mr","name":"मराठी"},{"code":"bn","name":"বাংলা"},{"code":"gu","name":"ગુજરાતી"},{"code":"pa","name":"ਪੰਜਾਬੀ"},{"code":"or","name":"ଓଡ଼ିଆ"},{"code":"as","name":"অসমীয়া"},{"code":"ur","name":"اردو","rtl":true},{"code":"sa","name":"संस्कृतम्"},{"code":"kok","name":"कोंकणी"},{"code":"ne","name":"नेपाली"},{"code":"mai","name":"मैथिली"},{"code":"doi","name":"डोगरी"},{"code":"brx","name":"बड़ो"},{"code":"ks","name":"کٲشُر","rtl":true},{"code":"sd","name":"سنڌي","rtl":true},{"code":"mni","name":"ꯃꯤꯇꯩꯂꯣꯟ"},{"code":"sat","name":"ᱥᱟᱱᱛᱟᱲᱤ"}];

export const FONTS: Record<string, string[]> = {
  "latin": [
    "Inter",
    "Poppins",
    "Lora",
    "Playfair Display",
    "Cormorant Garamond",
    "Great Vibes"
  ],
  "telugu": [
    "Noto Sans Telugu",
    "Noto Serif Telugu",
    "Ramabhadra",
    "Mandali",
    "NTR",
    "Gidugu",
    "Gurajada",
    "Suranna",
    "Tenali Ramakrishna",
    "Ramaraja",
    "Mallanna",
    "Peddana",
    "Sree Krushnadevaraya",
    "Timmana",
    "Hind Guntur",
    "Anek Telugu"
  ],
  "devanagari": [
    "Noto Sans Devanagari",
    "Noto Serif Devanagari",
    "Hind",
    "Mukta",
    "Tiro Devanagari Hindi",
    "Kalam",
    "Martel",
    "Baloo 2",
    "Rozha One",
    "Yatra One",
    "Amita",
    "Laila",
    "Khand"
  ],
  "bengali": [
    "Noto Sans Bengali",
    "Noto Serif Bengali",
    "Hind Siliguri",
    "Baloo Da 2",
    "Tiro Bangla",
    "Galada",
    "Atma",
    "Anek Bangla"
  ],
  "gurmukhi": [
    "Noto Sans Gurmukhi",
    "Noto Serif Gurmukhi",
    "Mukta Mahee",
    "Baloo Paaji 2",
    "Anek Gurmukhi"
  ],
  "gujarati": [
    "Noto Sans Gujarati",
    "Noto Serif Gujarati",
    "Hind Vadodara",
    "Mukta Vaani",
    "Baloo Bhai 2",
    "Rasa",
    "Shrikhand",
    "Anek Gujarati"
  ],
  "oriya": [
    "Noto Sans Oriya",
    "Noto Serif Oriya",
    "Baloo Bhaina 2",
    "Anek Odia"
  ],
  "tamil": [
    "Noto Sans Tamil",
    "Noto Serif Tamil",
    "Mukta Malar",
    "Catamaran",
    "Hind Madurai",
    "Meera Inimai",
    "Arima",
    "Baloo Thambi 2",
    "Anek Tamil"
  ],
  "kannada": [
    "Noto Sans Kannada",
    "Noto Serif Kannada",
    "Baloo Tamma 2",
    "Tiro Kannada",
    "Anek Kannada",
    "Hubballi"
  ],
  "malayalam": [
    "Noto Sans Malayalam",
    "Noto Serif Malayalam",
    "Manjari",
    "Gayathri",
    "Chilanka",
    "Baloo Chettan 2",
    "Anek Malayalam"
  ],
  "arabic": [
    "Noto Nastaliq Urdu",
    "Gulzar",
    "Noto Naskh Arabic",
    "Lateef"
  ],
  "meetei": [
    "Noto Sans Meetei Mayek"
  ],
  "olchiki": [
    "Noto Sans Ol Chiki"
  ]
};

export const SCRIPT_OF: Record<string, string> = {"en":"latin","te":"telugu","hi":"devanagari","mr":"devanagari","ne":"devanagari","sa":"devanagari","kok":"devanagari","mai":"devanagari","doi":"devanagari","brx":"devanagari","bn":"bengali","as":"bengali","pa":"gurmukhi","gu":"gujarati","or":"oriya","ta":"tamil","kn":"kannada","ml":"malayalam","ur":"arabic","ks":"arabic","sd":"arabic","mni":"meetei","sat":"olchiki"};

export const fontsFor = (lang: string): string[] => FONTS[SCRIPT_OF[lang]] ?? [];
