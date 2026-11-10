// php: Next.js route. Icons from @yuktishaalaa/yuktai/icons; the live demo is src/lib/docs/pages/php.ts.
import type { Metadata } from "next";
import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";
import GuideDemo from "@/components/guides/GuideDemo";

export const metadata: Metadata = {
  title: "PHP (Composer)",
  description: "composer require yuktishaalaa/yuktai: add the YuktAI accessibility widget, page tools and data grid to plain PHP, Laravel and WordPress pages in one line.",
};

export default function PhpPage() {
  return (
    <>
      {" "}
<div className={"page-head"}>{" "}
<p className={"kicker"}><YuktaiIcon name="layout" className="i" size={24} aria-hidden="true" />{"PHP (Composer)"}</p>{" "}
<h1>{"YuktAI for PHP"}</h1><p className={"lead"}>{"The "}<code>{"yuktishaalaa/yuktai"}</code>{" package adds YuktAI to any PHP page in one line: plain PHP, Laravel, WordPress or Symfony. You get the ♿ accessibility widget, the 🛠 page tools and everything in "}<code>{"window.yuktai"}</code>{". YuktAI still runs in the visitor's browser. The package only writes the right script tags for you."}</p></div>{" "}
<ul className={"checks"}>{" "}
<li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>{"No dependencies, PHP 8.1 or newer."}</span></li>{" "}
<li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>{"No API keys, no server calls, no telemetry."}</span></li>{" "}
<li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>{"Same features and options as the npm and Python packages."}</span></li>{" "}
</ul>{" "}
<h2 id={"install"}>{"1. Install"}</h2>{" "}
<div className={"codetabs"}><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"php-install-name"}>{"Terminal"}</span><button type={"button"} className={"copy-btn"} data-what={"Terminal"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" Terminal"}</span></button></div><pre><code id={"php-install"}>{"composer require yuktishaalaa/yuktai"}</code></pre></div></div>{" "}
<p className={"hint"}>{"On Packagist: "}<a href={"https://packagist.org/packages/yuktishaalaa/yuktai"} target={"_blank"} rel={"noopener noreferrer"}>{"packagist.org/packages/yuktishaalaa/yuktai"}<span className={"sr-only"}>{" (opens in a new tab)"}</span></a></p>{" "}
<h2 id={"plain"}>{"2. Plain PHP"}</h2>{" "}
<div className={"codetabs"}><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"php-plain-name"}>{"index.php (before </body>)"}</span><button type={"button"} className={"copy-btn"} data-what={"index.php (before </body>)"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" index.php (before </body>)"}</span></button></div><pre><code id={"php-plain"}>{"<?= \\Yuktai\\Yuktai::script(['position' => 'right', 'showPageTools' => true]) ?>"}</code></pre></div></div>{" "}
<p>{"Composer's "}<code>{"vendor/autoload.php"}</code>{" must be loaded once, as in any Composer project."}</p>{" "}
<h2 id={"laravel"}>{"3. Laravel"}</h2>{" "}
<div className={"codetabs"}><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"php-laravel-name"}>{"resources/views/layouts/app.blade.php (before </body>)"}</span><button type={"button"} className={"copy-btn"} data-what={"resources/views/layouts/app.blade.php (before </body>)"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" resources/views/layouts/app.blade.php (before </body>)"}</span></button></div><pre><code id={"php-laravel"}>{"{!! \\Yuktai\\Yuktai::script(['showPageTools' => true]) !!}"}</code></pre></div></div>{" "}
<p>{"Use "}<code>{"{!! !!}"}</code>{", not "}<code>{"{{ }}"}</code>{": the result is HTML and must not be escaped again."}</p>{" "}
<h2 id={"wordpress"}>{"4. WordPress"}</h2>{" "}
<div className={"codetabs"}><div className={"codefile"}><div className={"codehead"}><span className={"file"} id={"php-wp-name"}>{"functions.php (your theme)"}</span><button type={"button"} className={"copy-btn"} data-what={"functions.php (your theme)"}><YuktaiIcon name="copy" className="i" size={24} aria-hidden="true" /><span className={"copy-label"}>{"Copy"}</span><span className={"sr-only"}>{" functions.php (your theme)"}</span></button></div><pre><code id={"php-wp"}>{"add_action('wp_footer', function () {\n    echo \\Yuktai\\Yuktai::script(['position' => 'right', 'showPageTools' => true]);\n});"}</code></pre></div></div>{" "}
<p>{"WordPress loads "}<code>{"wp_footer"}</code>{" just before "}<code>{"</body>"}</code>{" on every page."}</p>{" "}
<h2 id={"options"}>{"Options"}</h2>{" "}
<table className={"ref"}><caption>{"Keys of the array passed to "}<code>{"Yuktai::script()"}</code></caption><thead><tr><th scope={"col"}>{"Option"}</th><th scope={"col"}>{"What it does"}</th></tr></thead><tbody><tr><td>{"version"}</td><td>{"YuktAI release to load. The package pins a tested release; "}<code>{"\"latest\""}</code>{" follows new releases."}</td></tr><tr><td>{"position"}</td><td><code>{"\"left\""}</code>{" or "}<code>{"\"right\""}</code></td></tr><tr><td>{"primaryColor"}</td><td>{"Button colour, for example "}<code>{"\"#0a4a85\""}</code></td></tr><tr><td>{"title"}</td><td>{"Title of the settings dialog (Telugu works)"}</td></tr><tr><td>{"showPageTools"}</td><td>{"Adds the 🛠 page tools button"}</td></tr><tr><td>{"defaultTab"}</td><td><code>{"copilot"}</code>{", "}<code>{"qa"}</code>{", "}<code>{"forms"}</code>{", "}<code>{"design"}</code>{", "}<code>{"ask"}</code>{" or "}<code>{"voice"}</code></td></tr><tr><td>{"voiceLang"}</td><td>{"Speech language, for example "}<code>{"\"te-IN\""}</code></td></tr><tr><td>{"autoFix, showSkipLinks"}</td><td>{"Accessibility engine options"}</td></tr><tr><td>{"extra"}</td><td>{"Any other "}<code>{"YUKTAI_CONFIG"}</code>{" key, as "}<code>{"['key' => value]"}</code></td></tr><tr><td>{"cdn"}</td><td><code>{"\"jsdelivr\""}</code>{" (default) or "}<code>{"\"unpkg\""}</code></td></tr><tr><td>{"defer"}</td><td><code>{"true"}</code>{" by default"}</td></tr><tr><td>{"nonce"}</td><td>{"For pages with a Content Security Policy"}</td></tr></tbody></table>{" "}
<h2 id={"safety"}>{"Safe by design"}</h2>{" "}
<div className={"grid2"}>{" "}
<div className={"card"}><h3><YuktaiIcon name="shieldCheck" className="i" size={24} aria-hidden="true" />{" Safe JSON"}</h3><p>{"Options are written with "}<code>{"JSON_HEX_TAG"}</code>{" and "}<code>{"JSON_HEX_AMP"}</code>{", so a value like "}<code>{"</script>"}</code>{" can't break out of the tag."}</p></div>{" "}
<div className={"card"}><h3><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" />{" Typos caught"}</h3><p>{"A wrong value or an unknown option name (like "}<code>{"showPagetools"}</code>{") throws "}<code>{"InvalidArgumentException"}</code>{" instead of being ignored."}</p></div>{" "}
<div className={"card"}><h3><YuktaiIcon name="lock" className="i" size={24} aria-hidden="true" />{" CSP ready"}</h3><p>{"Pass "}<code>{"'nonce' => $nonce"}</code>{" and both script tags get it. Add "}<code>{"cdn.jsdelivr.net"}</code>{" to "}<code>{"script-src"}</code>{", and "}<code>{"'wasm-unsafe-eval'"}</code>{" for the Rust engines."}</p></div>{" "}
<div className={"card"}><h3><YuktaiIcon name="code" className="i" size={24} aria-hidden="true" />{" Tested"}</h3><p>{"PHPUnit tests run on PHP 8.1, 8.2, 8.3 and 8.4 for every push."}</p></div>{" "}
</div>{" "}

      <GuideDemo page="php" />
    </>
  );
}
