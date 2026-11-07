import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/backend.css";
import ApiDemo from "./ApiDemo";

export const metadata: Metadata = { title: "Backend" };

export default function BackendPage() {
  return (
    <section className="wrap">
      <p className="kicker">Backend</p>
      <h1>Python API</h1>
      <p className="lead">
        A FastAPI backend lives in <code>backend/</code> and starts with <code>npm run dev</code>, next to Next.js and the Rust build. It
        serves 25 lakh sample orders page by page, made on demand: no database needed.
      </p>
      <ApiDemo />
      <p className="note">Agents (Grid Agent, RAG, Testing Agent, YuktAI Assistant): see the <Link href="/agents/">Agents page</Link>.</p>
      <h2>Add your own endpoint</h2>
      <pre><code>{`# backend/app/routes/hello.py  (every file here loads by itself)
from fastapi import APIRouter

router = APIRouter(prefix="/api/hello")

@router.get("")
def hello(name: str = "world") -> dict:
    return {"message": f"Hello, {name}"}`}</code></pre>
      <p className="note">Or let the YuktAI Assistant make it: <code>npm run assistant</code> → <code>add api hello</code>.</p>
      <p className="note">
        Then call it from any page with <code>fetch(`${"{config.api.url}"}/api/hello`)</code>. Interactive docs for every endpoint:
        {" "}<code>http://localhost:8000/docs</code>. Tests: <code>npm run test:api</code>.
      </p>
    </section>
  );
}
