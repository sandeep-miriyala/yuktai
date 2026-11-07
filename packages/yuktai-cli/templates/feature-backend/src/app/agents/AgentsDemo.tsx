"use client";

import { useEffect, useState, type FormEvent } from "react";
import config from "@config";

type Step = { tool: string; args: Record<string, unknown>; result: string };
type AgentReply = { answer: string | null; steps?: Step[]; sources?: { source: string; text: string }[]; mode: "groq" | "free" };

async function post(path: string, question: string): Promise<AgentReply> {
  const r = await fetch(`${config.api.url}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
  if (!r.ok) throw new Error(`The API said ${r.status}`);
  return r.json();
}

function Panel({ id, title, path, hint, examples }: { id: string; title: string; path: string; hint: string; examples: string[] }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<AgentReply | null>(null);
  const [error, setError] = useState("");

  const ask = async (question: string) => {
    if (!question.trim()) return;
    setBusy(true);
    setError("");
    try {
      setReply(await post(path, question));
    } catch (e) {
      setError(e instanceof Error ? e.message : "The API did not answer");
    } finally {
      setBusy(false);
    }
  };
  const submit = (e: FormEvent) => { e.preventDefault(); void ask(q); };

  return (
    <section id={id} className="agent-panel" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>{title}</h2>
      <p className="hint">{hint}</p>
      <form className="agent-form" onSubmit={submit}>
        <label htmlFor={`${id}-q`} className="sr-only">{title}: your question</label>
        <input id={`${id}-q`} value={q} onChange={(e) => setQ(e.target.value)} maxLength={500} autoComplete="off" placeholder={examples[0]} />
        <button type="submit" className="btn primary" disabled={busy}>{busy ? "Thinking…" : "Ask"}</button>
      </form>
      <p className="agent-examples">
        Try:{" "}
        {examples.map((x) => (
          <button key={x} type="button" className="chip" onClick={() => { setQ(x); void ask(x); }}>{x}</button>
        ))}
      </p>
      <div aria-live="polite">
        {error && <p className="api-status api-down" role="alert">{error}. Is the Python API running (npm run dev)?</p>}
        {reply && (
          <div className="agent-reply">
            <p className="agent-mode">{reply.mode === "groq" ? "Groq (your question was sent to Groq)" : "Free mode: no key, nothing left this computer"}</p>
            {reply.steps?.map((s, i) => (
              <p key={i} className="agent-step"><code>🔧 {s.tool}({Object.entries(s.args).filter(([, v]) => v !== null).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ")})</code> → {s.result}</p>
            ))}
            {reply.answer && <p className="agent-answer">{reply.answer}</p>}
            {reply.sources && reply.sources.length > 0 && (
              <ol className="agent-sources">
                {reply.sources.map((s) => <li key={s.source + s.text.slice(0, 20)}><strong>{s.source}</strong>: {s.text}</li>)}
              </ol>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** The Grid Agent and RAG panels, talking to the Python API. */
export default function AgentsDemo() {
  const [mode, setMode] = useState<string>("");
  useEffect(() => {
    fetch(`${config.api.url}/api/agents/status`)
      .then((r) => r.json())
      .then((s) => setMode(s.groq ? "Groq key found: agents use a language model." : "No Groq key: agents run in free mode."))
      .catch(() => setMode("The Python API is not running. Start it with npm run dev."));
  }, []);
  return (
    <>
      <p className="api-status" role="status">{mode || "Checking the agents…"}</p>
      <div className="agent-grid">
        <Panel
          id="grid-agent"
          title="🤖 Grid Agent"
          path="/api/agents/grid"
          hint="Counts, totals, averages, top orders and orders by city, with tools. Read-only."
          examples={["How many unpaid orders in Pune?", "Total amount in Hyderabad", "Top orders", "Orders by city"]}
        />
        <Panel
          id="rag"
          title="📚 Ask the documents (RAG)"
          path="/api/rag/ask"
          hint="Answers from backend/knowledge/*.md, with the passages it used."
          examples={["Where do I put the Groq key?", "How do I run the tests?", "How do I use a database?"]}
        />
      </div>
    </>
  );
}
