// The part of @yuktishaalaa/a11y the main package uses. The engine itself is
// bundled from packages/a11y/src (tsup alias), so the main package has no
// runtime dependency on it and no publish-order problem.
declare module "@yuktishaalaa/a11y" {
  export interface LangChange {
    el: Element
    lang: string
    scope: "page" | "part"
  }
  export function annotateLanguages(doc: Document, opts?: { apply: boolean; root?: Element | ShadowRoot }): LangChange[]
}
