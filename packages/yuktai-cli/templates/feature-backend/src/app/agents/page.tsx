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
      <div className="agent-grid">
        <section id="testing-agent" className="agent-panel" aria-labelledby="testing-agent-h">
          <h3 id="testing-agent-h">🧪 Testing Agent</h3>
          <p><code>npm run agent:test</code> runs lint, the site test, the API tests and the Playwright tests, then explains what failed and how to fix it.</p>
        </section>
        <section id="assistant" className="agent-panel" aria-labelledby="assistant-h">
          <h3 id="assistant-h">✨ YuktAI Assistant</h3>
          <p><code>npm run assistant</code> adds pages (<code>add page contact</code>) and API endpoints (<code>add api products</code>), showing each file and asking first, and answers how-to questions.</p>
        </section>
      </div>
      <p className="note">Both are off when <code>YUKTAI_ENV=production</code>. Make your own agent with <code>build_agent(tools, instructions, model)</code> in <code>backend/app/agents/base.py</code>.</p>
    </section>
  );
}
