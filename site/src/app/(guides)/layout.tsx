import GuideNav from "@/components/ui/GuideNav";
import "@/styles/guides.css";

// Every guide: the sidebar, a place for release notes, then the guide itself.
// guides.css holds the styles for code tabs, live demos and reference tables.
export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="guide-layout">
      <GuideNav />
      <div className="guide-body">
        <div className="banner" id="docs-banner" role="status" hidden />
        {children}
      </div>
    </div>
  );
}
