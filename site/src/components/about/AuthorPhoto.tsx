"use client";
// The photo sits on top of the initials. If it cannot load (offline, blocked), it hides
// itself and the initials show, instead of a broken-image icon.
import { useEffect, useRef } from "react";

export default function AuthorPhoto({ src }: { src: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const hide = () => { if (ref.current) ref.current.hidden = true; };
  // The error can happen before React is ready, so check once after load too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) img.hidden = true;
  }, []);
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt="" width={96} height={96} decoding="async" onError={hide} />;
}
