// Who made YuktAI: a small contact card on the About page.
// Email and WhatsApp open the visitor's own app. Nothing is collected here.
import { ChatIcon, SendIcon, CodeIcon, PersonIcon } from "@yuktishaalaa/yuktai/icons";
import { AUTHOR } from "@/data/site";
import { asset } from "@/lib/base";
import AuthorPhoto from "./AuthorPhoto";

const NEW_TAB = <span className="sr-only"> (opens in a new tab)</span>;

export default function AuthorCard() {
  const initials = AUTHOR.name.split(" ").map((w) => w[0]).join("");
  return (
    <article className="author" aria-labelledby="author-name">
      <div className="author-top">
        {/* Initials sit underneath, so the card still looks right if the photo cannot load. */}
        <span className="author-mark" aria-hidden="true">
          {initials}
          <AuthorPhoto src={AUTHOR.photo.startsWith("/") ? asset(AUTHOR.photo) : AUTHOR.photo} />
        </span>
        <div>
          <h2 id="author-name">{AUTHOR.name} <span lang="te" className="author-te">{AUTHOR.nameTe}</span></h2>
          <p className="author-role">{AUTHOR.role}</p>
        </div>
      </div>

      <p className="author-about">{AUTHOR.about}</p>

      <ul className="author-facts">
        {AUTHOR.facts.map((f) => <li key={f}>{f}</li>)}
      </ul>

      <p className="author-label">Also made by me</p>
      <ul className="author-projects">
        {AUTHOR.projects.map((p) => (
          <li key={p.name}><a href={p.href} target="_blank" rel="noopener noreferrer">{p.name}{NEW_TAB}</a></li>
        ))}
      </ul>

      <div className="author-actions">
        <a className="btn primary" href={AUTHOR.whatsapp} target="_blank" rel="noopener noreferrer">
          <ChatIcon size={20} aria-hidden="true" /> Message on WhatsApp{NEW_TAB}
        </a>
        <a className="btn" href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent("About YuktAI")}`}>
          <SendIcon size={20} aria-hidden="true" /> {AUTHOR.email}
        </a>
      </div>
      <p className="author-links">
        <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer"><CodeIcon size={18} aria-hidden="true" /> GitHub{NEW_TAB}</a>
        <a href={AUTHOR.linkedin} target="_blank" rel="noopener noreferrer"><PersonIcon size={18} aria-hidden="true" /> LinkedIn{NEW_TAB}</a>
      </p>
    </article>
  );
}
