import type { Metadata } from "next";
import "@/styles/icons.css";
import IconGallery from "./IconGallery";

export const metadata: Metadata = { title: "Icons" };

export default function IconsPage() {
  return (
    <section className="wrap">
      <p className="kicker">Icons guide</p>
      <h1>Every YuktAI icon</h1>
      <p className="lead">
        Pick an icon to get its code. All icons are SVG, follow the text colour by default and come in outline and filled styles.
        Decorative icons get <code>aria-hidden</code>; an icon that is the only content of a button gets a <code>label</code>.
      </p>
      <IconGallery />
      <h2>Rules that keep icons accessible</h2>
      <ul className="rules">
        <li>Next to text: decorative, so <code>aria-hidden=&quot;true&quot;</code>.</li>
        <li>Alone in a button: give the button a name, or the icon a <code>label</code>.</li>
        <li>Colour: at least 3:1 against the background (WCAG 1.4.11). The filled style picks a white or dark glyph for you.</li>
        <li>Size: buttons with an icon need a 24 × 24 px target at least (WCAG 2.5.8); 44 px is easier on phones.</li>
      </ul>
    </section>
  );
}
