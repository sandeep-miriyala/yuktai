import config from "@config";
import HeroAsk from "@/components/ui/HeroAsk";
import EngineDemo from "@/components/ui/EngineDemo";
import { AccessibilityIcon, ChatIcon, InstallIcon, SpeedIcon } from "@yuktishaalaa/yuktai/icons";

const FEATURES = [
  { icon: AccessibilityIcon, title: "Accessible", text: "The ♿ button: contrast, text size, dyslexia font, colour-blind filters, reduced motion." },
  { icon: ChatIcon, title: "Ask this page", text: "Press Ctrl + K. Answers come from the page itself, with the source highlighted." },
  { icon: SpeedIcon, title: "Fast core", text: "Heavy work runs in Rust compiled to WebAssembly, with a TypeScript fallback." },
  { icon: InstallIcon, title: "Installable", text: "Add it to a phone or desktop. After the first visit it works offline." },
];

export default function Home() {
  return (
    <>
      <section className="wrap hero">
        <p className="kicker">Built with YuktAI</p>
        <h1>{config.title}</h1>
        <p className="lead">{config.description} Edit this page in src/app/page.tsx and the settings in yuktai.config.ts.</p>
        {config.features.ask && <HeroAsk />}
        <EngineDemo />
      </section>
      <section className="wrap">
        <p className="kicker">What you get</p>
        <h2>Ready from the first page</h2>
        <ul className="cards">
          {FEATURES.map((f) => (
            <li key={f.title} className="card">
              <span className="iconbox"><f.icon size={22} aria-hidden="true" /></span>
              <strong>{f.title}</strong>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
