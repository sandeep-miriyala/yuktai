import type { Metadata } from "next";
import "@/styles/backend.css";
import AgentsDemo from "./AgentsDemo";

export const metadata: Metadata = { title: "Agents" };

export default function AgentsPage() {
  return (
    <section className="wrap">
      <p className="kicker">Agents</p>
      <h1>Agents built with LangGraph</h1>
      <p className="lead">
        Two agents run in the Python API (<code>backend/app/agents/</code>). Ask the Grid Agent about the orders, or ask your own
        documents (<code>backend/knowledge/</code>). Add <code>GROQ_API_KEY</code> to <code>backend/.env</code> for a language model;
        without it they work in free mode.
      </p>
      <AgentsDemo />
      <h2>Developer agents (in the terminal)</h2>
      <ul>
        <li><code>npm run agent:test</code>: the <strong>Testing Agent</strong> runs lint, the site test, the API tests and the Playwright tests, then explains what failed.</li>
        <li><code>npm run assistant</code>: the <strong>YuktAI Assistant</strong> adds pages and API endpoints (it shows each file and asks first) and answers how-to questions.</li>
      </ul>
      <p className="note">Both are off when <code>YUKTAI_ENV=production</code>. Make your own agent with <code>build_agent(tools, instructions, model)</code> in <code>backend/app/agents/base.py</code>.</p>
    </section>
  );
}
