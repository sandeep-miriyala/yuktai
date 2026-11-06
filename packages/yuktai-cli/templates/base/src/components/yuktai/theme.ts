// The theme lives on <html data-theme="light|dark">, saved in this browser only.
export function isDark() {
  const t = document.documentElement.getAttribute("data-theme");
  return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function subscribeTheme(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  document.addEventListener("yuktai:theme", onChange);
  mq.addEventListener("change", onChange);
  return () => {
    document.removeEventListener("yuktai:theme", onChange);
    mq.removeEventListener("change", onChange);
  };
}

export function setTheme(next: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("yuktai-theme", next); } catch {}
  document.dispatchEvent(new Event("yuktai:theme"));
}

/** Runs before first paint (inline in <head>) so there is no flash of the wrong theme. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("yuktai-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
