import { useState } from "react";

// Bump when thumbnails are re-rendered so browsers fetch the new PNGs.
export const THUMB_VERSION = 3;

/**
 * A preview thumbnail with graceful emoji fallback (used before a pose/prop
 * thumbnail PNG exists, or if it fails to load).
 */
export function Thumb({ src, emoji, alt }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <span className="thumb__emoji">{emoji}</span>;
  const busted = src + (src.includes("?") ? "&" : "?") + "v=" + THUMB_VERSION;
  return (
    <img
      className="thumb__img"
      src={busted}
      alt={alt || ""}
      loading="lazy"
      draggable={false}
      onError={() => setErr(true)}
    />
  );
}
