import Link from "next/link";
export default function NotFound() {
  return (
    <section className="wrap notfound">
      <p className="kicker">404</p>
      <h1>This page is not here</h1>
      <p className="lead">It may have moved when the docs were rebuilt. Try the guides, or ask a question with Ctrl + K.</p>
      <p><Link className="btn primary" href="/#guides">Go to the guides</Link></p>
    </section>
  );
}
