import { useState } from "react";

/**
 * A preview thumbnail with graceful emoji fallback (used before a pose/prop
 * thumbnail PNG exists, or if it fails to load).
 */
export function Thumb({ src, emoji, alt }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <span className="thumb__emoji">{emoji}</span>;
  return (
    <img
      className="thumb__img"
      src={src}
      alt={alt || ""}
      loading="lazy"
      draggable={false}
      onError={() => setErr(true)}
    />
  );
}
