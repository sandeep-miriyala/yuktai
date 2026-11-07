import Link from "next/link";
import { Reveal } from "@yuktishaalaa/yuktai/experience";
import config from "@config";
import HeroAsk from "@/components/ui/HeroAsk";
import EngineDemo from "@/components/ui/EngineDemo";
import { AccessibilityIcon, ChatIcon, FactCheckIcon, GridIcon, InstallIcon, PaletteIcon, RepeatIcon, SpeedIcon, StarIcon } from "@yuktishaalaa/yuktai/icons";

type Feature = { icon: typeof ChatIcon; title: string; text: string; href?: string; on?: boolean };

const FEATURES: Feature[] = [
  { icon: GridIcon, title: "Data grid", text: "10 lakh rows with the Grid AI Assistant, 🎤 voice and 24 languages. Search and sort in Rust.", href: "/grid/", on: config.features.grid },
  { icon: FactCheckIcon, title: "QA report", text: "15 WCAG checks on any page, with a Markdown report.", href: "/qa/", on: config.features.pageTools },
  { icon: StarIcon, title: "Icons guide", text: "Every YuktAI icon. Search, pick a colour, copy the code.", href: "/icons/", on: config.features.icons },
  { icon: RepeatIcon, title: "Lifecycle", text: "Three moments for every part: onStart, onChange, onEnd.", href: "/lifecycle/", on: {{hasLifecycleGuide}} },
  { icon: ChatIcon, title: "Ask this page", text: "Press Ctrl + K. Answers come from the page itself, with the source highlighted.", on: config.features.ask },
  { icon: AccessibilityIcon, title: "Accessible", text: "The ♿ button: contrast, text size, dyslexia font, colour-blind filters, reduced motion.", on: config.features.accessibility },
  { icon: PaletteIcon, title: "Colour and font", text: "The 🎨 button: any colour (kept readable at 7:1) and any font, even ones on your computer.", on: config.theme.picker },
  { icon: SpeedIcon, title: "Fast core", text: "Heavy work runs in Rust compiled to WebAssembly, with a TypeScript fallback.", on: true },
  { icon: InstallIcon, title: "Installable", text: "Add it to a phone or desktop. After the first visit it works offline.", on: config.features.pwa },
];

export default function Home() {
  return (
    <>
      <section className="wrap hero">
        <p className="kicker">Built with YuktAI</p>
        <h1 className="yk-pop">{config.title}</h1>
        <p className="lead">{config.description} Edit this page in src/app/page.tsx and the settings in yuktai.config.ts.</p>
        {config.features.ask && <HeroAsk />}
        <EngineDemo />
      </section>
      {/* Sections and cards fade in as you scroll; the 🌐 button lets visitors turn it off */}
      <section className="wrap">
        <p className="kicker">What you get</p>
        <h2>Ready from the first page</h2>
        <ul className="cards">
          {FEATURES.filter((f) => f.on).map((f, i) => {
            const inner = (
              <>
                <span className="iconbox"><f.icon size={22} aria-hidden="true" /></span>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </>
            );
            return (
              <Reveal as="li" key={f.title} delay={(i % 3) * 80}>
                {f.href ? <Link className="card yk-lift" href={f.href}>{inner}</Link> : <div className="card yk-lift">{inner}</div>}
              </Reveal>
            );
          })}
        </ul>
      </section>
    </>
  );
}
