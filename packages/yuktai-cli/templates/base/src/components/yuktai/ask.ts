// The Ask page panel (@yuktishaalaa/ask-page), added once by <Providers>.
type AskEl = HTMLElement & {
  openPanel?: (focus?: boolean) => Promise<void>;
  askQuestion?: (q: string) => Promise<void>;
};

export function askPanel(): AskEl | null {
  return typeof document === "undefined" ? null : (document.querySelector("yuktai-ask") as AskEl | null);
}

/** Opens the panel; with a question, asks it. */
export function ask(question?: string) {
  const el = askPanel();
  if (!el) return;
  const q = question?.trim();
  if (q && el.askQuestion) void el.askQuestion(q);
  else if (el.openPanel) void el.openPanel(true);
}
