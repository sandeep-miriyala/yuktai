"use client";
// శుభలేఖ తయారీ: code రాని వారికి. Phone లో 3 అడుగులు → Netlify లో పత్రిక.
// ఫోటోలు ఇక్కడే (browser లోనే) చిన్నవి చేసి పంపుతాం. ఈ పేజీ ఏదీ నిల్వ చేయదు; మార్చడానికి కోడ్
// మాత్రమే ఈ phone లో (localStorage) ఉంటుంది.
import { useEffect, useRef, useState } from "react";
import { MAKER_API, LANGS, fontsFor } from "@/data/shubhalekha";

type Ev = { name: string; date: string; time: string; venue: string; address: string; map: string };
type Faq = { q: string; a: string };
type Form = {
  type: string; theme: string; languages: string[]; fonts: Record<string, string>;
  title: string; slug: string; message: string; events: Ev[]; whatsapp: string; faq: Faq[];
  email: string; consent: boolean; website: string;
};
type Photo = { name: string; data: string; url: string };
type Saved = { siteId: string; editToken: string; url: string; deleteOn: string; editsLeft: number; form?: Form };
type Step = "home" | "type" | "details" | "photos" | "sending" | "ready" | "full";
type Slots = { left: number; total: number; opensAgain: string } | null;

const STORE_KEY = "shubhalekha-maker";
const MAX_PHOTOS = 5;

const TYPES: { key: string; te: string; ev: string; icon: string }[] = [
  { key: "wedding", te: "పెళ్లి", ev: "వివాహం", icon: "rings" },
  { key: "engagement", te: "నిశ్చితార్థం", ev: "నిశ్చితార్థం", icon: "rings" },
  { key: "housewarming", te: "గృహప్రవేశం", ev: "గృహప్రవేశం", icon: "home" },
  { key: "birthday", te: "పుట్టినరోజు", ev: "పుట్టినరోజు వేడుక", icon: "cake" },
  { key: "naming", te: "నామకరణం", ev: "నామకరణం", icon: "baby" },
  { key: "annaprasana", te: "అన్నప్రాశన", ev: "అన్నప్రాశన", icon: "baby" },
  { key: "aksharabhyasam", te: "అక్షరాభ్యాసం", ev: "అక్షరాభ్యాసం", icon: "book" },
  { key: "upanayanam", te: "ఉపనయనం", ev: "ఉపనయనం", icon: "lamp" },
  { key: "seemantham", te: "సీమంతం", ev: "సీమంతం", icon: "baby" },
  { key: "shashtipurti", te: "షష్టిపూర్తి", ev: "షష్టిపూర్తి", icon: "star" },
  { key: "anniversary", te: "వార్షికోత్సవం", ev: "వివాహ వార్షికోత్సవం", icon: "rings" },
  { key: "puja", te: "పూజ, వ్రతం", ev: "పూజ", icon: "lamp" },
  { key: "opening", te: "ప్రారంభోత్సవం", ev: "ప్రారంభోత్సవం", icon: "star" },
  { key: "memorial", te: "స్మరణ సభ", ev: "స్మరణ సభ", icon: "lamp" },
];

const THEMES = [
  { key: "traditional", te: "సంప్రదాయ", color: "#7a1f1f" },
  { key: "modern", te: "ఆధునిక", color: "#1e3a5f" },
  { key: "simple", te: "సాదా", color: "#333333" },
];

const ICONS: Record<string, string> = {
  rings: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M10 4l2 3 2-3"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  cake: '<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M4 15h16M12 11V7"/>',
  baby: '<circle cx="12" cy="8" r="4"/><path d="M5 21c1-4 4-6 7-6s6 2 7 6"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  lamp: '<path d="M12 3c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7z"/><path d="M6 15h12l-2 5H8z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  next: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chat: '<path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cal: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
};
function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}

// భారత కాలమానంలో తేదీలు
const todayIST = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
const addDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const teDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("te-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const emptyEvent = (name = ""): Ev => ({ name, date: "", time: "", venue: "", address: "", map: "" });
const blank = (): Form => ({
  type: "", theme: "traditional", languages: ["te", "en"], fonts: {}, title: "", slug: "", message: "",
  events: [emptyEvent()], whatsapp: "+91 ", faq: [], email: "", consent: false, website: "",
});

function readSaved(): Saved | null {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch { return null; }
}
function writeSaved(s: Saved | null) {
  try { if (s) localStorage.setItem(STORE_KEY, JSON.stringify(s)); else localStorage.removeItem(STORE_KEY); } catch { /* private window */ }
}

/** ఫోటో: browser లోనే 1600 px కి, JPEG గా (అన్ని phones లో పనిచేస్తుంది) */
async function shrink(file: File): Promise<Photo> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob: Blob = await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("photo"))), "image/jpeg", 0.82));
  const data: string = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.readAsDataURL(blob); });
  return { name: file.name, data, url: URL.createObjectURL(blob) };
}

/** Font చూపించడానికి మాత్రమే: ఎంచుకున్న font ను ఈ పేజీలో, preview అక్షరాలకే */
function useFontPreview(families: string[], text: string) {
  useEffect(() => {
    const links = families.map((f) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f).replace(/%20/g, "+")}&display=swap&text=${encodeURIComponent(text)}`;
      document.head.appendChild(l);
      return l;
    });
    return () => links.forEach((l) => l.remove());
  }, [families.join("|"), text]); // eslint-disable-line react-hooks/exhaustive-deps
}

export default function Maker() {
  const [step, setStep] = useState<Step>("home");
  const [form, setForm] = useState<Form>(blank);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [slots, setSlots] = useState<Slots>(null);
  const [slotsError, setSlotsError] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [editing, setEditing] = useState<{ siteId: string; editToken: string } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Saved | null>(null);
  const [opensAgain, setOpensAgain] = useState("");
  const [busyPhotos, setBusyPhotos] = useState(false);
  const [copied, setCopied] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);

  // మొదట: స్లాట్లు, ఈ phone లో ముందు చేసిన పత్రిక, email లోని "మార్చు" link
  useEffect(() => {
    fetch(`${MAKER_API}/slots`).then((r) => r.json()).then(setSlots).catch(() => setSlotsError(true));
    Promise.resolve().then(() => {
      setSaved(readSaved());
      const m = location.hash.match(/^#edit=([\w-]+)\.([a-f0-9]+)$/);
      if (m) setEditing({ siteId: m[1], editToken: m[2] });
    });
  }, []);

  // అడుగు మారితే శీర్షిక మీదకు focus (screen reader కి కొత్త పేజీ తెలుస్తుంది)
  useEffect(() => { if (step !== "home") heading.current?.focus(); }, [step]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setEvent = (i: number, k: keyof Ev, v: string) => setForm((f) => ({ ...f, events: f.events.map((e, j) => (j === i ? { ...e, [k]: v } : e)) }));
  const setFaq = (i: number, k: keyof Faq, v: string) => setForm((f) => ({ ...f, faq: f.faq.map((q, j) => (j === i ? { ...q, [k]: v } : q)) }));
  const toggleLang = (code: string) => setForm((f) => {
    const on = f.languages.includes(code);
    if (on && f.languages.length === 1) return f;
    const languages = on ? f.languages.filter((l) => l !== code) : [...f.languages, code];
    const fonts = Object.fromEntries(Object.entries(f.fonts).filter(([l]) => languages.includes(l)));
    return { ...f, languages, fonts };
  });

  const today = todayIST();
  const lastDay = addDays(today, 120);
  const typeInfo = TYPES.find((t) => t.key === form.type);
  const previewText = [...new Set(`${form.title || "శుభలేఖ"}${LANGS.filter((l) => form.languages.includes(l.code)).map((l) => l.name).join("")}Aa`)].join("");
  useFontPreview(Object.values(form.fonts), previewText);

  function start(type: string) {
    const t = TYPES.find((x) => x.key === type)!;
    setForm((f) => ({ ...f, type, events: f.events.length === 1 && !f.events[0].name ? [emptyEvent(t.ev)] : f.events }));
    setStep("details");
  }

  function detailsProblems() {
    const p: string[] = [];
    if (!form.title.trim()) p.push("పేర్లు / శీర్షిక నింపండి");
    form.events.forEach((e, i) => {
      if (!e.name.trim() || !e.date) p.push(`కార్యక్రమం ${i + 1}: పేరు, తేదీ నింపండి`);
    });
    if (form.whatsapp.replace(/\D/g, "").length < 10) p.push("దేశ కోడ్‌తో WhatsApp నంబర్ ఇవ్వండి (ఉదా: +91 98xxxxxxxx)");
    return p;
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setBusyPhotos(true);
    try {
      const room = MAX_PHOTOS - photos.length;
      const made = await Promise.all([...files].slice(0, room).map(shrink));
      setPhotos((p) => [...p, ...made]);
    } catch {
      setErrors(["ఒక ఫోటో చదవలేకపోయాం. వేరే ఫోటో ప్రయత్నించండి."]);
    } finally {
      setBusyPhotos(false);
    }
  }

  async function submit() {
    const p: string[] = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) p.push("email సరిగ్గా ఇవ్వండి");
    if (!form.consent) p.push("సమ్మతి పెట్టెను టిక్ చేయండి");
    if (p.length) { setErrors(p); return; }
    setErrors([]);
    setStep("sending");
    const body = {
      type: form.type, theme: form.theme, languages: form.languages, fonts: form.fonts,
      title: form.title, slug: form.slug, message: form.message,
      events: form.events.map((e) => ({ ...e, name: e.name.trim(), venue: e.venue.trim(), address: e.address.trim(), map: e.map.trim() })),
      rsvp: { whatsapp: form.whatsapp }, faq: form.faq.filter((q) => q.q.trim() && q.a.trim()),
      photos: photos.map((x) => ({ data: x.data })), email: form.email, consent: form.consent, website: form.website,
      ...(editing ?? {}),
    };
    try {
      const res = await fetch(`${MAKER_API}/${editing ? "update" : "create"}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const s: Saved = { siteId: data.siteId, editToken: editing?.editToken ?? data.editToken, url: data.url, deleteOn: data.deleteOn, editsLeft: data.editsLeft, form: { ...form, consent: false } };
        writeSaved(s);
        setSaved(s);
        setResult(s);
        setEditing(null);
        if (location.hash) history.replaceState(null, "", location.pathname);
        setStep("ready");
        return;
      }
      if (data.full) { setOpensAgain(data.opensAgain); setStep("full"); return; }
      const known: Record<string, string> = {
        "one-per-email": "ఈ email తో ఇప్పటికే ఒక పత్రిక ఉంది. దాన్ని మార్చుకోండి.",
        "wrong-code": "మార్చే కోడ్ సరిపోలలేదు. Email లోని link తో మళ్లీ తెరవండి.",
        "no-edits-left": "ఈ పత్రికకు మార్పులు అయిపోయాయి (2 సార్లు).",
        "too-large": "ఫోటోలు చాలా పెద్దవి. ఒకటి రెండు తీసేసి మళ్లీ ప్రయత్నించండి.",
        "build-failed": "పత్రిక తయారీలో సమస్య వచ్చింది. కొంచెంసేపు ఆగి మళ్లీ ప్రయత్నించండి.",
      };
      setErrors(data.errors?.map((e: { message: string }) => e.message) ?? [known[data.error] ?? "ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి."]);
      setStep("photos");
    } catch {
      setErrors(["సేవను చేరలేకపోయాం. Internet చూసి మళ్లీ ప్రయత్నించండి."]);
      setStep("photos");
    }
  }

  function editSaved() {
    if (!saved) return;
    setEditing({ siteId: saved.siteId, editToken: saved.editToken });
    if (saved.form) setForm({ ...saved.form, consent: false });
    setPhotos([]);
    setStep("details");
  }

  async function copy(text: string, what: string) {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(""), 2000); } catch { /* చేత్తో copy */ }
  }

  const full = slots && slots.left <= 0 && !editing;
  const progress = (n: number) => (
    <div className="mk-progress">
      <span>{`అడుగు ${n} / 3${typeInfo ? ` · ${typeInfo.te}` : ""}`}</span>
      <div className="mk-bars" aria-hidden="true">{[1, 2, 3].map((i) => <i key={i} className={i <= n ? "on" : ""} />)}</div>
    </div>
  );
  const back = (to: Step) => (
    <button type="button" className="mk-back" onClick={() => { setErrors([]); setStep(to); }} aria-label="వెనక్కి"><Icon name="back" /></button>
  );
  const problems = errors.length > 0 && (
    <div className="mk-errors" role="alert">
      <strong>సరిచేయండి:</strong>
      <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
    </div>
  );

  return (
    <div className="mk" lang="te">
      {step === "home" && (
        <section className="mk-screen" aria-labelledby="mk-h">
          <h1 id="mk-h" className="mk-title">మీ శుభకార్యానికి అందమైన ఆహ్వాన పత్రిక</h1>
          <p className="mk-lead">Phone లోనే, 3 అడుగుల్లో. ఉచితం. ఏమీ install చేయనక్కర్లేదు.</p>

          {(saved || editing) && (
            <div className="mk-card mk-edit">
              <strong>{editing && !saved ? "మీ పత్రికను మార్చండి" : "మీరు ఇంతకు ముందు చేసిన పత్రిక"}</strong>
              {saved && <a href={saved.url} target="_blank" rel="noopener noreferrer">{saved.url}<span className="sr-only"> (కొత్త tab లో)</span></a>}
              <button type="button" className="mk-btn ghost" onClick={() => (saved ? editSaved() : setStep("type"))}>మార్చండి</button>
            </div>
          )}

          <div className="mk-slots" aria-live="polite">
            <span className="mk-slots-n">{slots ? `${slots.left}/${slots.total}` : slotsError ? "!" : "…"}</span>
            <span>
              <strong>{slots ? (slots.left > 0 ? `ఈ నెల ${slots.left} స్లాట్లు మిగిలాయి` : "ఈ నెల స్లాట్లు నిండాయి") : slotsError ? "స్లాట్లు చూడలేకపోయాం" : "స్లాట్లు చూస్తున్నాం…"}</strong>
              <span>{`నెలకు ${slots?.total ?? 4} పత్రికలు మాత్రమే`}</span>
            </span>
          </div>

          <ul className="mk-ticks">
            {["22 భాషల్లో, మీకు నచ్చిన అక్షరాల (font) తో", "అతిథుల ప్రశ్నలకు పత్రికే జవాబు చెబుతుంది", "\"వస్తున్నాం\" అని మీ WhatsApp కి నేరుగా", "వేడుక అయిన 7 రోజులకు మీ వివరాలన్నీ తొలగిస్తాం"].map((t) => (
              <li key={t}><Icon name="check" />{t}</li>
            ))}
          </ul>

          <button type="button" className="mk-btn" onClick={() => (full ? (setOpensAgain(slots!.opensAgain), setStep("full")) : setStep("type"))}>
            పత్రిక తయారు చేయండి <Icon name="next" />
          </button>
          <p className="mk-note">సుమారు 5 నిమిషాలు పడుతుంది</p>
        </section>
      )}

      {step === "type" && (
        <section className="mk-screen" aria-labelledby="mk-h">
          <div className="mk-top">{back("home")}{progress(1)}</div>
          <h1 id="mk-h" ref={heading} tabIndex={-1} className="mk-title">ఏ శుభకార్యం?</h1>
          <div className="mk-types">
            {TYPES.map((t) => (
              <button key={t.key} type="button" className={`mk-type${form.type === t.key ? " on" : ""}`} aria-pressed={form.type === t.key} onClick={() => start(t.key)}>
                <Icon name={t.icon} size={34} />
                <span>{t.te}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "details" && (
        <form className="mk-screen" aria-labelledby="mk-h" onSubmit={(e) => { e.preventDefault(); const p = detailsProblems(); setErrors(p); if (!p.length) setStep("photos"); }}>
          <div className="mk-top">{back(editing ? "home" : "type")}{progress(2)}</div>
          <h1 id="mk-h" ref={heading} tabIndex={-1} className="mk-title">వివరాలు నింపండి</h1>
          {problems}

          <div className="mk-field">
            <label htmlFor="mk-title">{form.type === "wedding" || form.type === "engagement" ? "వధూవరుల పేర్లు" : "శీర్షిక (ఉదా: మా గృహప్రవేశం)"}</label>
            <input id="mk-title" value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={120} required autoComplete="off" />
          </div>

          <div className="mk-field">
            <label htmlFor="mk-msg">ఆహ్వాన వాక్యం <span className="mk-opt">(ఐచ్ఛికం)</span></label>
            <textarea id="mk-msg" rows={3} value={form.message} onChange={(e) => set("message", e.target.value)} maxLength={300} placeholder="ఖాళీగా వదిలితే మంచి ఆహ్వాన వాక్యం మేమే పెడతాం" />
          </div>

          {form.events.map((ev, i) => (
            <fieldset key={i} className="mk-card mk-event">
              <legend>{form.events.length > 1 ? `కార్యక్రమం ${i + 1}` : "కార్యక్రమం"}</legend>
              <div className="mk-field">
                <label htmlFor={`mk-ev-${i}`}>పేరు</label>
                <input id={`mk-ev-${i}`} value={ev.name} onChange={(e) => setEvent(i, "name", e.target.value)} maxLength={80} required />
              </div>
              <div className="mk-two">
                <div className="mk-field">
                  <label htmlFor={`mk-date-${i}`}>తేదీ</label>
                  <input id={`mk-date-${i}`} type="date" min={today} max={lastDay} value={ev.date} onChange={(e) => setEvent(i, "date", e.target.value)} required />
                </div>
                <div className="mk-field">
                  <label htmlFor={`mk-time-${i}`}>సమయం / ముహూర్తం</label>
                  <input id={`mk-time-${i}`} type="time" value={ev.time} onChange={(e) => setEvent(i, "time", e.target.value)} />
                </div>
              </div>
              <div className="mk-field">
                <label htmlFor={`mk-venue-${i}`}>చోటు (మండపం, ఇల్లు)</label>
                <input id={`mk-venue-${i}`} value={ev.venue} onChange={(e) => setEvent(i, "venue", e.target.value)} maxLength={120} />
              </div>
              <div className="mk-field">
                <label htmlFor={`mk-addr-${i}`}>చిరునామా <span className="mk-opt">(ఐచ్ఛికం)</span></label>
                <input id={`mk-addr-${i}`} value={ev.address} onChange={(e) => setEvent(i, "address", e.target.value)} maxLength={200} />
              </div>
              <div className="mk-field">
                <label htmlFor={`mk-map-${i}`}>Google Maps link <span className="mk-opt">(ఐచ్ఛికం)</span></label>
                <input id={`mk-map-${i}`} type="url" inputMode="url" placeholder="https://maps.app.goo.gl/…" value={ev.map} onChange={(e) => setEvent(i, "map", e.target.value)} />
                <span className="mk-hint">Google Maps లో చోటు తెరిచి Share → Copy link</span>
              </div>
              {form.events.length > 1 && (
                <button type="button" className="mk-link" onClick={() => set("events", form.events.filter((_, j) => j !== i))}>ఈ కార్యక్రమం తీసేయండి</button>
              )}
            </fieldset>
          ))}
          {form.events.length < 5 && (
            <button type="button" className="mk-btn ghost" onClick={() => set("events", [...form.events, emptyEvent()])}><Icon name="plus" /> ఇంకో కార్యక్రమం (ఉదా: విందు)</button>
          )}

          <div className="mk-field">
            <label htmlFor="mk-wa">&quot;వస్తున్నాం&quot; సందేశాలు వచ్చే WhatsApp నంబర్</label>
            <input id="mk-wa" type="tel" inputMode="tel" autoComplete="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} required />
          </div>

          <fieldset className="mk-card">
            <legend>పత్రిక భాషలు</legend>
            <p className="mk-hint">మొదట ఎంచుకున్నది ముందు కనిపిస్తుంది. అతిథులు తమ భాషకు మారవచ్చు.</p>
            <div className="mk-langs">
              {LANGS.map((l) => {
                const on = form.languages.includes(l.code);
                const n = form.languages.indexOf(l.code) + 1;
                return (
                  <button key={l.code} type="button" lang={l.code} dir={l.rtl ? "rtl" : undefined} className={`mk-chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggleLang(l.code)}>
                    {on && <span className="mk-chip-n" aria-hidden="true">{n}</span>}{l.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mk-card">
            <legend>అక్షరాల శైలి (font)</legend>
            <p className="mk-hint">ప్రతి భాషకు నచ్చిన అక్షరాలు. పత్రికలో వాడిన అక్షరాలు మాత్రమే load అవుతాయి, కాబట్టి పేజీ వేగంగా తెరుచుకుంటుంది.</p>
            {form.languages.map((l) => {
              const lang = LANGS.find((x) => x.code === l)!;
              const list = fontsFor(l);
              const chosen = form.fonts[l] ?? "";
              return (
                <div key={l} className="mk-field mk-font">
                  <label htmlFor={`mk-font-${l}`}>{lang.name}</label>
                  <select id={`mk-font-${l}`} value={chosen} onChange={(e) => set("fonts", e.target.value ? { ...form.fonts, [l]: e.target.value } : Object.fromEntries(Object.entries(form.fonts).filter(([k]) => k !== l)))}>
                    <option value="">Phone లోని మామూలు అక్షరాలు</option>
                    {list.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="mk-sample" lang={l} dir={lang.rtl ? "rtl" : undefined} style={{ fontFamily: chosen ? `"${chosen}", var(--font)` : undefined }}>{form.title || lang.name}</p>
                </div>
              );
            })}
          </fieldset>

          <fieldset className="mk-card">
            <legend>రంగు</legend>
            <div className="mk-themes">
              {THEMES.map((t) => (
                <label key={t.key} className={`mk-theme${form.theme === t.key ? " on" : ""}`}>
                  <input type="radio" name="mk-theme" value={t.key} checked={form.theme === t.key} onChange={() => set("theme", t.key)} />
                  <span className="mk-swatch" style={{ background: t.color }} aria-hidden="true" />
                  {t.te}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mk-card">
            <legend>అతిథుల ప్రశ్నలు <span className="mk-opt">(ఐచ్ఛికం)</span></legend>
            <p className="mk-hint">ఉదా: &quot;పార్కింగ్ ఉందా?&quot;, &quot;భోజనం ఎప్పుడు?&quot;. సమయం, చోటు, RSVP ప్రశ్నలకు పత్రిక తానే జవాబిస్తుంది.</p>
            {form.faq.map((q, i) => (
              <div key={i} className="mk-faq">
                <div className="mk-field"><label htmlFor={`mk-q-${i}`}>ప్రశ్న {i + 1}</label><input id={`mk-q-${i}`} value={q.q} onChange={(e) => setFaq(i, "q", e.target.value)} maxLength={150} /></div>
                <div className="mk-field"><label htmlFor={`mk-a-${i}`}>జవాబు</label><input id={`mk-a-${i}`} value={q.a} onChange={(e) => setFaq(i, "a", e.target.value)} maxLength={300} /></div>
                <button type="button" className="mk-link" onClick={() => set("faq", form.faq.filter((_, j) => j !== i))}>తీసేయండి</button>
              </div>
            ))}
            {form.faq.length < 5 && <button type="button" className="mk-btn ghost" onClick={() => set("faq", [...form.faq, { q: "", a: "" }])}><Icon name="plus" /> ప్రశ్న జోడించండి</button>}
          </fieldset>

          <div className="mk-field">
            <label htmlFor="mk-slug">Link పేరు, English లో <span className="mk-opt">(ఐచ్ఛికం)</span></label>
            <input id="mk-slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} maxLength={30} placeholder="priya-arjun" autoCapitalize="none" spellCheck={false} />
            <span className="mk-hint">{`మీ link: ${(form.slug || "priya-arjun").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shubhalekha"}-xyz.netlify.app`}</span>
          </div>

          <button type="submit" className="mk-btn">తర్వాత <Icon name="next" /></button>
        </form>
      )}

      {step === "photos" && (
        <section className="mk-screen" aria-labelledby="mk-h">
          <div className="mk-top">{back("details")}{progress(3)}</div>
          <h1 id="mk-h" ref={heading} tabIndex={-1} className="mk-title">ఫోటోలు, సమ్మతి</h1>
          {problems}

          <div className="mk-field">
            <span className="mk-label" id="mk-photos-l">ఫోటోలు <span className="mk-opt">{`(ఐచ్ఛికం, గరిష్ఠంగా ${MAX_PHOTOS})`}</span></span>
            <p className="mk-hint">మొదటి ఫోటో పత్రిక పైన, WhatsApp preview లో వస్తుంది. పెద్ద ఫోటోలను ఇక్కడే చిన్నవి చేస్తాం.{editing ? " మార్చేటప్పుడు ఫోటోలు మళ్లీ ఎంచుకోండి." : ""}</p>
            <div className="mk-photos" role="group" aria-labelledby="mk-photos-l">
              {photos.map((p, i) => (
                <div key={p.url} className="mk-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`ఫోటో ${i + 1}`} />
                  <button type="button" onClick={() => setPhotos(photos.filter((x) => x !== p))} aria-label={`ఫోటో ${i + 1} తీసేయండి`}><Icon name="close" size={18} /></button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="mk-add">
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} disabled={busyPhotos} />
                  <Icon name="plus" size={30} />
                  <span className="sr-only">ఫోటో జోడించండి</span>
                </label>
              )}
            </div>
            <span className="mk-hint" aria-live="polite">{busyPhotos ? "ఫోటోలు సిద్ధం చేస్తున్నాం…" : `${photos.length} / ${MAX_PHOTOS} ఫోటోలు`}</span>
          </div>

          <div className="mk-warn">
            <Icon name="cal" />
            <span>
              <strong>{form.events.some((e) => e.date) ? `${teDate(addDays(form.events.map((e) => e.date).filter(Boolean).sort().at(-1)!, 7))} న తొలగిస్తాం` : "వేడుక అయిన 7 రోజులకు తొలగిస్తాం"}</strong>
              పత్రిక, ఫోటోలు, మీ వివరాలు అన్నీ పూర్తిగా తొలగిస్తాం. 2 రోజుల ముందే email లో గుర్తు చేస్తాం.
            </span>
          </div>

          <div className="mk-field">
            <label htmlFor="mk-email">మీ email (link, మార్చే కోడ్, గుర్తు సందేశం కోసం)</label>
            <input id="mk-email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>

          {/* bots మాత్రమే నింపుతాయి */}
          <div className="mk-hp" aria-hidden="true">
            <label htmlFor="mk-website">Website</label>
            <input id="mk-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
          </div>

          <label className="mk-consent">
            <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
            <span>నా వివరాలు ఈ పత్రిక కోసం మాత్రమే వాడండి, పై తేదీన తొలగించండి. Link ఉన్నవారికి పత్రిక కనిపిస్తుందని నాకు తెలుసు.</span>
          </label>

          <button type="button" className="mk-btn" onClick={submit} disabled={busyPhotos}>
            {editing ? "పత్రిక మార్చండి" : "పత్రిక తయారు చేయండి"} <Icon name="check" />
          </button>
        </section>
      )}

      {step === "sending" && (
        <section className="mk-screen mk-center" aria-labelledby="mk-h" aria-busy="true">
          <div className="mk-spin" aria-hidden="true" />
          <h1 id="mk-h" ref={heading} tabIndex={-1} className="mk-title">పత్రిక తయారవుతోంది…</h1>
          <p className="mk-lead" role="status">సుమారు 20 సెకన్లు. ఈ పేజీ మూసేయకండి.</p>
        </section>
      )}

      {step === "ready" && result && (
        <section className="mk-screen" aria-labelledby="mk-h">
          <div className="mk-done"><Icon name="check" size={34} /></div>
          <h1 id="mk-h" ref={heading} tabIndex={-1} className="mk-title mk-c">మీ పత్రిక సిద్ధం!</h1>

          <div className="mk-card mk-linkbox">
            <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url.replace(/^https:\/\//, "")}<span className="sr-only"> (కొత్త tab లో)</span></a>
            <button type="button" className="mk-btn ghost small" onClick={() => copy(result.url, "url")}><Icon name="copy" size={18} />{copied === "url" ? "Copy అయింది" : "Copy"}</button>
          </div>

          <a className="mk-btn wa" href={`https://wa.me/?text=${encodeURIComponent(`${form.title} — ఆహ్వానం 🙏\n${result.url}`)}`} target="_blank" rel="noopener noreferrer">
            <Icon name="chat" /> WhatsApp లో పంపండి<span className="sr-only"> (కొత్త tab లో)</span>
          </a>

          <div className="mk-two">
            <a className="mk-btn ghost" href={`${result.url}site-qr.png`} target="_blank" rel="noopener noreferrer">QR కోడ్<span className="sr-only"> (కొత్త tab లో)</span></a>
            <a className="mk-btn ghost" href={result.url} target="_blank" rel="noopener noreferrer"><Icon name="eye" /> చూడండి<span className="sr-only"> (కొత్త tab లో)</span></a>
          </div>
          <p className="mk-hint">పత్రిక తెరుచుకోవడానికి ఒక నిమిషం పట్టొచ్చు.</p>

          <div className="mk-card">
            <strong>మార్చే కోడ్ (ఎవరికీ పంపకండి)</strong>
            <code className="mk-code">{result.editToken}</code>
            <button type="button" className="mk-btn ghost small" onClick={() => copy(result.editToken, "code")}><Icon name="copy" size={18} />{copied === "code" ? "Copy అయింది" : "కోడ్ copy"}</button>
            <span className="mk-hint">{`ఇంకా ${result.editsLeft} సార్లు మార్చుకోవచ్చు. ఈ కోడ్, link మీ email కి కూడా పంపాం. ఈ phone లో ఈ పేజీ మళ్లీ తెరిస్తే "మార్చండి" కనిపిస్తుంది.`}</span>
          </div>

          <p className="mk-note"><Icon name="clock" size={18} />{`${teDate(result.deleteOn)} న తొలగించబడుతుంది`}</p>
        </section>
      )}

      {step === "full" && (
        <section className="mk-screen" aria-labelledby="mk-h">
          <h1 id="mk-h" ref={heading} tabIndex={-1} className="mk-title">ఈ నెల స్లాట్లు నిండాయి</h1>
          <p className="mk-lead">{`ఈ నెల ${slots?.total ?? 4} పత్రికలూ తయారయ్యాయి.${opensAgain ? ` ${teDate(opensAgain)} నుంచి మళ్లీ స్లాట్లు తెరుచుకుంటాయి.` : ""}`}</p>
          <div className="mk-card">
            <strong>వేడుక దగ్గరలో ఉందా?</strong>
            <span>ఇంట్లో computer తెలిసిన వారు ఉంటే, శుభలేఖ ఉచిత tool తో వారే 10 నిమిషాల్లో తయారు చేయగలరు.</span>
            <a href="../">ఎలా చేయాలో చూడండి</a>
          </div>
          <button type="button" className="mk-btn ghost" onClick={() => setStep("home")}>మొదటి పేజీకి</button>
        </section>
      )}
    </div>
  );
}
