// @ts-nocheck
// jquery: the live demo on /jquery/. Ported from the earlier site; it runs once YuktAI
// (bundled from npm, Rust engines included) is ready, through the global Docs helpers.
export default function run(): void {
/* jQuery page: a live demo that loads the jQuery version you pick and runs
   YuktAI and Ask page next to it, called from ordinary jQuery code.
   One jQuery per page load: changing the version reloads with ?jq=<version>. */
(function () {
  "use strict";
  var VERSIONS = ["4.0.0", "3.7.1", "2.2.4", "1.12.4"];
  var byId = function (id) { return document.getElementById(id); };
  var select = byId("jq-ver"), status = byId("jq-status");
  if (!select) return;

  var wanted = new URLSearchParams(location.search).get("jq");
  var version = VERSIONS.indexOf(wanted) >= 0 ? wanted : VERSIONS[0];
  select.value = version;

  select.addEventListener("change", function () {
    var url = new URL(location.href);
    url.searchParams.set("jq", select.value);
    url.hash = "demo";
    location.href = url.toString();
  });

  status.textContent = "Loading jQuery " + version + "…";
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/jquery@" + version + "/dist/jquery.min.js";
  s.onerror = function () { status.textContent = "jQuery " + version + " could not load. Check your connection and reload."; };
  s.onload = function () {
    var jq = window.jQuery;
    window.Docs.ready(function (yk) { start(jq, yk); });
  };
  document.body.appendChild(s);

  // ── the part a site owner would write, in ordinary jQuery style ──────────
  function start($, yuktai) {
    $(function () {
      var rows = window.DocsData.staff(25);
      yuktai.renderGrid($("#jq-grid")[0], {
        data: rows, columns: window.DocsData.staffColumns, rowKey: "id", label: "Staff directory",
        engine: "auto", search: true, pagination: { pageSize: 5 }
      });

      $("#jq-contrast").on("click", function () {
        var on = $(this).attr("aria-pressed") !== "true";
        yuktai.apply({ highContrast: on });
        $(this).attr("aria-pressed", String(on));
      });

      $("#jq-ask").on("click", function () {
        var panel = document.querySelector("yuktai-ask");
        if (panel && panel.askQuestion) panel.askQuestion("Which jQuery versions work?");
      });

      status.textContent = "Running on jQuery " + $.fn.jquery + ". Grid, accessibility and Ask page are live below.";
    });
  }
})();
}
