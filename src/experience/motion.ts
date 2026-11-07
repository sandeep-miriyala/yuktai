// ─────────────────────────────────────────────────────────────────────────────
// Visitor-controlled animations.
// The visitor chooses how much moves: "auto" follows the device's reduced-motion
// setting, "off" stops all animation, "calm" fades and slides, "lively" adds
// floating, shimmer and pop. The choice lives on <html data-motion="off|calm|lively">
// and is saved in this browser only.
// ─────────────────────────────────────────────────────────────────────────────

export type MotionChoice = "auto" | "off" | "calm" | "lively";
export type MotionLevel = Exclude<MotionChoice, "auto">;

export const MOTION_CHOICES: MotionChoice[] = ["auto", "off", "calm", "lively"];
export const MOTION_KEY = "yuktai-motion";
const EVENT = "yuktai:motion";

const reduced = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The saved choice ("auto" when nothing is saved). */
export function getMotionChoice(): MotionChoice {
  try {
    const v = localStorage.getItem(MOTION_KEY);
    if (v === "off" || v === "calm" || v === "lively") return v;
  } catch {}
  return "auto";
}

/** What actually runs now: the choice, with "auto" resolved from the device setting. */
export function resolveMotion(choice: MotionChoice = getMotionChoice()): MotionLevel {
  if (choice !== "auto") return choice;
  return reduced() ? "off" : "calm";
}

/** The level on <html> right now ("calm" on the server). */
export function getMotion(): MotionLevel {
  if (typeof document === "undefined") return "calm";
  const v = document.documentElement.getAttribute("data-motion");
  return v === "off" || v === "lively" || v === "calm" ? v : resolveMotion();
}

export function setMotion(choice: MotionChoice) {
  try {
    if (choice === "auto") localStorage.removeItem(MOTION_KEY);
    else localStorage.setItem(MOTION_KEY, choice);
  } catch {}
  document.documentElement.setAttribute("data-motion", resolveMotion(choice));
  document.dispatchEvent(new Event(EVENT));
}

/** For useSyncExternalStore: runs onChange when the choice or the device setting changes. */
export function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const device = () => {
    if (getMotionChoice() === "auto") document.documentElement.setAttribute("data-motion", resolveMotion("auto"));
    onChange();
  };
  document.addEventListener(EVENT, onChange);
  mq.addEventListener("change", device);
  return () => {
    document.removeEventListener(EVENT, onChange);
    mq.removeEventListener("change", device);
  };
}

/**
 * Motion CSS. Off stops every animation and transition on the page.
 * Utility classes for your own parts:
 *  .yk-lift     raises a card a little on hover (calm, lively)
 *  .yk-float    floats gently up and down (lively)
 *  .yk-shimmer  moving gradient on text that uses background-clip (lively)
 *  .yk-pop      grows in when it appears (lively)
 */
export const MOTION_CSS = `
:root[data-motion="off"] *:not(.yk-splash),:root[data-motion="off"] *::before,:root[data-motion="off"] *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;animation-delay:0s!important;transition-duration:.01ms!important;transition-delay:0s!important;scroll-behavior:auto!important}
.yk-lift{transition:transform .25s ease,box-shadow .25s ease}
:root:not([data-motion="off"]) .yk-lift:hover{transform:translateY(-4px);box-shadow:0 18px 40px -18px var(--yk-lift-shadow,rgba(0,24,120,.35))}
:root[data-motion="lively"] .yk-lift:hover{transform:translateY(-6px) scale(1.015)}
:root[data-motion="lively"] .yk-float{animation:yk-float 5s ease-in-out infinite}
:root[data-motion="lively"] .yk-shimmer{background-size:200% auto!important;animation:yk-shimmer 4s linear infinite}
:root[data-motion="lively"] .yk-pop{animation:yk-pop .6s cubic-bezier(.2,.9,.3,1.3) both}
.yk-reveal{transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1)}
.yk-reveal.yk-armed{opacity:0;transform:translateY(18px)}
:root[data-motion="lively"] .yk-reveal{transition-duration:.8s}
:root[data-motion="lively"] .yk-reveal.yk-armed{transform:translateY(36px) scale(.96)}
:root[data-motion="off"] .yk-reveal.yk-armed{opacity:1;transform:none}
@keyframes yk-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes yk-shimmer{to{background-position:200% center}}
@keyframes yk-pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
`;

/**
 * Put this in <head> before anything paints (inline script). It sets
 * <html data-motion> from the visitor's choice and adds MOTION_CSS once.
 */
export const MOTION_SCRIPT = `(function(){try{var d=document.documentElement,v=null;try{v=localStorage.getItem(${JSON.stringify(MOTION_KEY)})}catch(e){}if(v!=="off"&&v!=="calm"&&v!=="lively"){v=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"off":"calm"}d.setAttribute("data-motion",v);if(!document.getElementById("yk-motion-css")){var s=document.createElement("style");s.id="yk-motion-css";s.textContent=${JSON.stringify(MOTION_CSS.replace(/\n/g, ""))};document.head.appendChild(s)}}catch(e){}})();`;

/** Adds MOTION_CSS when MOTION_SCRIPT was not used (safe to call many times). */
export function ensureMotionCss() {
  if (typeof document === "undefined") return;
  if (!document.documentElement.hasAttribute("data-motion")) document.documentElement.setAttribute("data-motion", resolveMotion());
  if (document.getElementById("yk-motion-css")) return;
  const s = document.createElement("style");
  s.id = "yk-motion-css";
  s.textContent = MOTION_CSS;
  document.head.appendChild(s);
}
