import { useId } from "react";

// The YuktAI mark: the "Y of agents". Three agents (circles) joined at one hub,
// with a spark at the hub for the intelligence that connects them.
// White on a navy → blue tile: 6:1 at the lightest corner, 19:1 at the darkest.
const AGENTS = [[18, 18], [46, 18], [32, 48]];
const SPARK = "M32 21Q34.1 28.9 42 31Q34.1 33.1 32 41Q29.9 33.1 22 31Q29.9 28.9 32 21Z";

export default function Logo({ size = 38, label }: { size?: number; label?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="logo"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <defs>
        <linearGradient id={`yk${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#000633" />
          <stop offset="1" stopColor="#0053ED" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#yk${id})`} />
      {AGENTS.map(([x, y]) => (
        <line key={`l${x}${y}`} x1={x} y1={y} x2={32} y2={31} stroke="#fff" strokeWidth="3.8" strokeLinecap="round" />
      ))}
      {AGENTS.map(([x, y]) => (
        <circle key={`c${x}${y}`} cx={x} cy={y} r="6.4" fill="#fff" />
      ))}
      <path d={SPARK} fill="#fff" />
    </svg>
  );
}
