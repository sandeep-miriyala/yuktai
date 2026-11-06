import GuideNav from "@/components/ui/GuideNav";
import "@/styles/guides.css";

// Every guide: the sidebar, then the guide itself.
export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="guide-layout">
      <GuideNav />
      <article className="guide-body">{children}</article>
    </div>
  );
}
