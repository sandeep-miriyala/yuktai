// శుభలేఖ తయారీ: code రాని వారి కోసం. Form ఇక్కడ (GitHub Pages), పత్రిక Netlify లో.
import type { Metadata } from "next";
import Maker from "@/components/shubhalekha/Maker";

export const metadata: Metadata = {
  title: "శుభలేఖ తయారీ: phone లోనే ఆహ్వాన పత్రిక",
  description: "పెళ్లి, గృహప్రవేశం, ఉపనయనం… ఏ శుభకార్యానికైనా phone లోనే 3 అడుగుల్లో ఆహ్వాన పత్రిక. 22 భాషలు, నచ్చిన అక్షరాలు, WhatsApp RSVP. ఉచితం; వేడుక అయిన 7 రోజులకు అన్నీ తొలగిస్తాం.",
};

export default function MakePage() {
  return (
    <div className="wrap mk-wrap">
      <Maker />
    </div>
  );
}
