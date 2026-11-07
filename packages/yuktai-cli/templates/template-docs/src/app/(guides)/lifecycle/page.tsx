import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lifecycle" };

const START = `const life = useLifecycle({
  part: "grid",
  onStart: () => console.log("ready"),        // once, when it is on the page
  onChange: (what) => console.log(what),      // every time life.change(what) is called
  onEnd: () => console.log("bye"),            // once, when it leaves the page
});`;

const CHANGE = `<YuktaiGrid data={rows} columns={columns} onSearchTime={life.change} />`;

const LISTEN = `window.addEventListener("yuktai:lifecycle", (e) => {
  const { part, stage, detail } = e.detail;   // "grid", "change", { query, rows, ms, engine }
});`;

export default function Lifecycle() {
  return (
    <>
      <p className="kicker">Guide</p>
      <h1>Lifecycle</h1>
      <p className="lead">Every YuktAI part has three moments. That is the whole lifecycle.</p>

      <div className="table-box">
        <table>
          <caption className="sr-only">The three lifecycle moments</caption>
          <thead><tr><th scope="col">Hook</th><th scope="col">When</th><th scope="col">Use it to</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>onStart</code></th><td>The part is on the page and ready</td><td>Load data, start a timer, focus a field</td></tr>
            <tr><th scope="row"><code>onChange</code></th><td>The visitor changed something</td><td>Show a count, save a filter, update a chart</td></tr>
            <tr><th scope="row"><code>onEnd</code></th><td>The part leaves the page</td><td>Stop timers, free memory</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Use it in a component</h2>
      <p>The hook is in <code>src/components/yuktai/lifecycle.ts</code>. It works in any client component.</p>
      <pre><code>{START}</code></pre>
      <p>Pass <code>life.change</code> wherever something changes. The grid page does this:</p>
      <pre><code>{CHANGE}</code></pre>
      <p>
        <code>onStart</code> can wait for data: <code>useLifecycle(hooks, ready)</code> runs it only when <code>ready</code> is true.
        If <code>onStart</code> returns a function, it runs before <code>onEnd</code>.
      </p>

      <h2>Listen to every part at once</h2>
      <p>Each moment is also a <code>yuktai:lifecycle</code> event on <code>window</code>, for your own logging or tests:</p>
      <pre><code>{LISTEN}</code></pre>

      <h2>Where it is used</h2>
      <ul>
        <li>Data grid: <code>onStart</code> when 25 lakh rows are ready, <code>onChange</code> after every search or sort, <code>onEnd</code> when you leave.</li>
        <li>QA report: <code>onChange</code> with the score after every check.</li>
        <li>Icons guide: <code>onChange</code> with the icon you picked.</li>
      </ul>
    </>
  );
}
