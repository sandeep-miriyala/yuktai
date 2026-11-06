import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap">
      <p className="kicker">404</p>
      <h1>This page is not here</h1>
      <p className="lead">It may have moved. Go back home, or press Ctrl + K to ask.</p>
      <p><Link className="btn primary" href="/">Home</Link></p>
    </section>
  );
}
