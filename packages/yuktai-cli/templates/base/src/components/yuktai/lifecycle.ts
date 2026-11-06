"use client";
// The YuktAI lifecycle: three moments, nothing more.
//
//   onStart   the part is on the page and ready (data loaded, engine picked)
//   onChange  something the visitor did changed it (search, sort, a new report…)
//   onEnd     the part is leaving the page: stop timers, free memory
//
// Use it in any client component:
//
//   const life = useLifecycle({
//     onStart: () => console.log("ready"),
//     onChange: (what) => console.log("changed", what),
//     onEnd: () => console.log("bye"),
//   });
//   life.change({ query: "pune" });   // calls onChange
//
// Every call is also sent as a "yuktai:lifecycle" event on window, so one place
// (analytics you own, a test, the console) can listen to every part at once:
//   window.addEventListener("yuktai:lifecycle", (e) => console.log(e.detail));
import { useCallback, useEffect, useRef } from "react";

export type LifecycleStage = "start" | "change" | "end";
export type LifecycleEvent<T = unknown> = { part: string; stage: LifecycleStage; detail?: T; at: number };

export type LifecycleHooks<T = unknown> = {
  /** A name for this part, e.g. "grid". Shown in the window event. */
  part?: string;
  onStart?: () => void | (() => void);
  onChange?: (detail: T) => void;
  onEnd?: () => void;
};

function emit<T>(part: string, stage: LifecycleStage, detail?: T) {
  if (typeof window === "undefined") return;
  const event: LifecycleEvent<T> = { part, stage, detail, at: performance.now() };
  window.dispatchEvent(new CustomEvent("yuktai:lifecycle", { detail: event }));
}

/**
 * onStart once after the first paint, onEnd once when the component leaves.
 * Call `change(detail)` whenever something changes; it runs onChange.
 * onStart may return a cleanup function; it runs before onEnd.
 * Pass `ready: false` to hold onStart until something has loaded.
 */
export function useLifecycle<T = unknown>(hooks: LifecycleHooks<T>, ready = true) {
  const ref = useRef(hooks);
  useEffect(() => {
    ref.current = hooks;
  });
  const part = hooks.part ?? "part";

  useEffect(() => {
    if (!ready) return;
    const cleanup = ref.current.onStart?.();
    emit(part, "start");
    return () => {
      if (typeof cleanup === "function") cleanup();
      ref.current.onEnd?.();
      emit(part, "end");
    };
  }, [part, ready]);

  const change = useCallback(
    (detail: T) => {
      ref.current.onChange?.(detail);
      emit(part, "change", detail);
    },
    [part],
  );

  return { change };
}
