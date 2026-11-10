import {
  AccessibilityIcon, GridIcon, RobotIcon, ChatIcon, ToolsIcon, CodeIcon, HubIcon,
  LayoutIcon, WandIcon, StarIcon, DataObjectIcon, SpeedIcon, InstallIcon,
} from "@yuktishaalaa/yuktai/icons";
import type { IconKey } from "@/data/site";

// The site uses YuktAI's own icon set (163 icons in @yuktishaalaa/yuktai/icons).
const MAP = {
  accessibility: AccessibilityIcon, grid: GridIcon, robot: RobotIcon, chat: ChatIcon,
  tools: ToolsIcon, code: CodeIcon, hub: HubIcon, layout: LayoutIcon, wand: WandIcon,
  star: StarIcon, dataObject: DataObjectIcon, speed: SpeedIcon, install: InstallIcon,
};

export function GuideIcon({ name, size = 22 }: { name: IconKey; size?: number }) {
  const C = MAP[name];
  return <C size={size} aria-hidden="true" />;
}
