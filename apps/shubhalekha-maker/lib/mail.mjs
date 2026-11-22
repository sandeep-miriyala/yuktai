// వాడుకరికి 3 సందేశాలు: సిద్ధం, తొలగింపుకు ముందు, తొలగించాం. Gmail ద్వారా (ఉచితం).
// GMAIL_USER, GMAIL_APP_PASSWORD Netlify environment variables లో మాత్రమే. లేకపోతే email పంపదు.
import nodemailer from "nodemailer";

const fmt = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString("te-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function messages(kind, r) {
  const date = fmt(r.deleteOn);
  if (kind === "ready") {
    return {
      subject: "మీ శుభలేఖ సిద్ధం / Your Shubhalekha is ready",
      text: `నమస్కారం 🙏

మీ పత్రిక సిద్ధం: ${r.url}
WhatsApp లో ఈ link పంపండి. QR కోడ్: ${r.url}site-qr.png

మార్చడానికి ఈ link తెరవండి (ఎవరికీ పంపకండి): ${r.editLink}
${r.editsLeft} సార్లు మార్చుకోవచ్చు.

${date} న పత్రిక, ఫోటోలు, మీ వివరాలు అన్నీ తొలగిస్తాం.

—
Your invitation is ready: ${r.url}
Edit link (keep it private): ${r.editLink}
Everything will be deleted on ${r.deleteOn}.

శుభలేఖ · YuktAI · https://sandeep-miriyala.github.io/yuktai/shubhalekha/make/`,
    };
  }
  if (kind === "reminder") {
    return {
      subject: "మీ శుభలేఖ త్వరలో తొలగించబడుతుంది / Your Shubhalekha will be deleted soon",
      text: `నమస్కారం 🙏

మీ పత్రిక ${r.url} ${date} న తొలగించబడుతుంది.
ఫోటోలు మీ phone లోనే ఉన్నాయి. QR లేదా పేజీ కావాలంటే ఈ రోజే save చేసుకోండి.

—
Your invitation ${r.url} will be deleted on ${r.deleteOn}.`,
    };
  }
  return {
    subject: "మీ శుభలేఖ తొలగించాం / Your Shubhalekha was deleted",
    text: `నమస్కారం 🙏

మీ పత్రిక, ఫోటోలు, వివరాలు, ఈ email అన్నీ తొలగించాం.
మీ శుభకార్యం బాగా జరిగిందని ఆశిస్తున్నాం. ధన్యవాదాలు.

—
Your invitation, photos, details and this email address have been deleted. Thank you.`,
  };
}

export function mailer({ user = process.env.GMAIL_USER, pass = process.env.GMAIL_APP_PASSWORD, transport } = {}) {
  const t = transport ?? (user && pass ? nodemailer.createTransport({ service: "gmail", auth: { user, pass } }) : null);
  return {
    enabled: !!t,
    async send(kind, record) {
      if (!t) return false;
      const m = messages(kind, record);
      try {
        await t.sendMail({ from: `Shubhalekha <${user}>`, to: record.email, subject: m.subject, text: m.text });
        return true;
      } catch (e) {
        console.error(`mail ${kind} failed: ${e.message}`); // చిరునామా log చేయం
        return false;
      }
    },
  };
}
