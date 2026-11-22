// నిజమైన deps: Netlify Blobs (store), Netlify API, Gmail, shubhalekha build.
import { getStore } from "@netlify/blobs";
import { build, template, LANGS, fontsFor } from "@yuktishaalaa/shubhalekha";
import { netlifyClient } from "./netlify.mjs";
import { mailer } from "./mail.mjs";
import { TYPES } from "./core.mjs";
import { makeHandlers } from "./handlers.mjs";

function blobStore() {
  const s = getStore({ name: "shubhalekha", consistency: "strong" });
  return {
    get: (k) => s.get(k, { type: "json" }),
    set: (k, v) => s.setJSON(k, v),
    del: (k) => s.delete(k),
    list: async (prefix) => (await s.list({ prefix })).blobs.map((b) => b.key),
  };
}

let handlers;
export function getHandlers() {
  handlers ??= makeHandlers({
    store: blobStore(),
    netlify: netlifyClient(),
    mail: mailer(),
    build,
    templates: Object.fromEntries(TYPES.map((t) => [t, template(t)])),
    languages: LANGS,
    fontsFor,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
    makerPage: process.env.MAKER_PAGE,
  });
  return handlers;
}
