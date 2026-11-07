export type MotionChoice = "auto" | "off" | "calm" | "lively";
export type MotionLevel = Exclude<MotionChoice, "auto">;
export declare const MOTION_CHOICES: MotionChoice[];
export declare const MOTION_KEY = "yuktai-motion";
/** The saved choice ("auto" when nothing is saved). */
export declare function getMotionChoice(): MotionChoice;
/** What actually runs now: the choice, with "auto" resolved from the device setting. */
export declare function resolveMotion(choice?: MotionChoice): MotionLevel;
/** The level on <html> right now ("calm" on the server). */
export declare function getMotion(): MotionLevel;
export declare function setMotion(choice: MotionChoice): void;
/** For useSyncExternalStore: runs onChange when the choice or the device setting changes. */
export declare function subscribeMotion(onChange: () => void): () => void;
/**
 * Motion CSS. Off stops every animation and transition on the page.
 * Utility classes for your own parts:
 *  .yk-lift     raises a card a little on hover (calm, lively)
 *  .yk-float    floats gently up and down (lively)
 *  .yk-shimmer  moving gradient on text that uses background-clip (lively)
 *  .yk-pop      grows in when it appears (lively)
 */
export declare const MOTION_CSS = "\n:root[data-motion=\"off\"] *:not(.yk-splash),:root[data-motion=\"off\"] *::before,:root[data-motion=\"off\"] *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;animation-delay:0s!important;transition-duration:.01ms!important;transition-delay:0s!important;scroll-behavior:auto!important}\n.yk-lift{transition:transform .25s ease,box-shadow .25s ease}\n:root:not([data-motion=\"off\"]) .yk-lift:hover{transform:translateY(-4px);box-shadow:0 18px 40px -18px var(--yk-lift-shadow,rgba(0,24,120,.35))}\n:root[data-motion=\"lively\"] .yk-lift:hover{transform:translateY(-6px) scale(1.015)}\n:root[data-motion=\"lively\"] .yk-float{animation:yk-float 5s ease-in-out infinite}\n:root[data-motion=\"lively\"] .yk-shimmer{background-size:200% auto!important;animation:yk-shimmer 4s linear infinite}\n:root[data-motion=\"lively\"] .yk-pop{animation:yk-pop .6s cubic-bezier(.2,.9,.3,1.3) both}\n.yk-reveal{transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1)}\n.yk-reveal.yk-armed{opacity:0;transform:translateY(18px)}\n:root[data-motion=\"lively\"] .yk-reveal{transition-duration:.8s}\n:root[data-motion=\"lively\"] .yk-reveal.yk-armed{transform:translateY(36px) scale(.96)}\n:root[data-motion=\"off\"] .yk-reveal.yk-armed{opacity:1;transform:none}\n@keyframes yk-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}\n@keyframes yk-shimmer{to{background-position:200% center}}\n@keyframes yk-pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}\n";
/**
 * Put this in <head> before anything paints (inline script). It sets
 * <html data-motion> from the visitor's choice and adds MOTION_CSS once.
 */
export declare const MOTION_SCRIPT: string;
/** Adds MOTION_CSS when MOTION_SCRIPT was not used (safe to call many times). */
export declare function ensureMotionCss(): void;
