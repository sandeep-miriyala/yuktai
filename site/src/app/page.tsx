import { Reveal } from "@yuktishaalaa/yuktai/experience";
import Hero from "@/components/home/Hero";
import { Charts, Compare, Demos, Guides, HowItWorks, Packages, Pipeline, Recognition, Stacks, Start, Stats } from "@/components/home/Sections";

// Each section fades in as it scrolls into view. The visitor can turn this off
// (or make it livelier) from the 🌐 button in the header.
export default function Home() {
  return (
    <>
      <div className="wrap"><Hero /></div>
      <Reveal><Stats /></Reveal>
      {/* What a visitor needs first: their language, then the packages, then proof */}
      <Reveal><Stacks /></Reveal>
      <Reveal><Packages /></Reveal>
      <Reveal><Demos /></Reveal>
      <Reveal><Compare /></Reveal>
      <Reveal><Pipeline /></Reveal>
      <Reveal><HowItWorks /></Reveal>
      <Reveal><Charts /></Reveal>
      <Reveal><Guides /></Reveal>
      <Reveal><Start /></Reveal>
      <Reveal><Recognition /></Reveal>
    </>
  );
}
