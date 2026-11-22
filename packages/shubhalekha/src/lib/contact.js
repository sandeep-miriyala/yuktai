// WhatsApp, email, ఫోన్ links + business card కోసం vCard.

/** "+91 98480 22338" → "919848022338" (wa.me కి అంకెలు మాత్రమే) */
export const digits = (phone) => String(phone || "").replace(/\D/g, "");

export function whatsappUrl(phone, text = "") {
  const n = digits(phone);
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function mailtoUrl(email, subject = "", body = "") {
  const p = [];
  if (subject) p.push(`subject=${encodeURIComponent(subject)}`);
  if (body) p.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${p.length ? `?${p.join("&")}` : ""}`;
}

export const telUrl = (phone) => `tel:+${digits(phone)}`;

const escV = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** vCard 3.0: ఫోన్‌లో ఒక్క tap తో contact save */
export function buildVcard(card) {
  const [first, ...rest] = String(card.name || "").trim().split(/\s+/);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N;CHARSET=UTF-8:${escV(rest.join(" "))};${escV(first)};;;`,
    `FN;CHARSET=UTF-8:${escV(card.name)}`,
  ];
  if (card.business) lines.push(`ORG;CHARSET=UTF-8:${escV(card.business)}`);
  if (card.role) lines.push(`TITLE;CHARSET=UTF-8:${escV(card.role)}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL:+${digits(card.phone)}`);
  if (card.email) lines.push(`EMAIL;TYPE=INTERNET:${card.email}`);
  if (card.website) lines.push(`URL:${card.website}`);
  if (card.address) lines.push(`ADR;CHARSET=UTF-8;TYPE=WORK:;;${escV(card.address)};;;;`);
  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}
