// ──────────────────────────────────────────────────────────────────────────
// Persistence for the block builder: compact (de)serialization + localStorage
// auto-save + shareable-URL encoding + JSON file export/import.
//
// A build is stored as an array of COMPACT rows [typeIdx, gx, gy, gz, rot/90,
// colorIdx] so both localStorage and share links stay small. Bricks/colours are
// referenced by their index in the catalog, which is stable at runtime.
// ──────────────────────────────────────────────────────────────────────────
import { BRICKS, COLORS } from "./bricks";

const KEY = "lomoni.build.v1";
const TYPES = Object.keys(BRICKS);

export function toCompact(blocks) {
  return blocks.map((b) => [
    Math.max(0, TYPES.indexOf(b.type)),
    b.gx,
    b.gy,
    b.gz,
    (b.rot || 0) / 90,
    Math.max(0, COLORS.indexOf(b.color)),
  ]);
}

export function fromCompact(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((a) => Array.isArray(a) && a.length >= 4)
    .map((a) => ({
      type: TYPES[a[0]] || TYPES[0],
      gx: a[1] | 0,
      gy: a[2] | 0,
      gz: a[3] | 0,
      rot: ((a[4] | 0) * 90) % 360,
      color: COLORS[a[5]] || COLORS[0],
    }));
}

// ── localStorage ──
export function saveLocal(blocks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(toCompact(blocks)));
  } catch {
    /* storage full / disabled — ignore */
  }
}
export function loadLocal() {
  try {
    const s = localStorage.getItem(KEY);
    return s ? fromCompact(JSON.parse(s)) : [];
  } catch {
    return [];
  }
}

// ── share URL (UTF-8-safe base64 in the hash) ──
export function encodeShare(blocks) {
  const json = JSON.stringify(toCompact(blocks));
  return btoa(unescape(encodeURIComponent(json)));
}
export function decodeShare(str) {
  try {
    return fromCompact(JSON.parse(decodeURIComponent(escape(atob(str)))));
  } catch {
    return null;
  }
}

// ── JSON file export / import ──
export function toFile(blocks) {
  return JSON.stringify({ app: "lomoni-brick-builder", version: 1, blocks: toCompact(blocks) });
}
export function fromFile(text) {
  try {
    const o = JSON.parse(text);
    return fromCompact(Array.isArray(o) ? o : o.blocks);
  } catch {
    return null;
  }
}

/** Blocks to load at startup: a shared #b=… link wins, else localStorage. */
export function initialBlocks() {
  if (typeof window !== "undefined") {
    const m = window.location.hash.match(/[#&]b=([^&]+)/);
    if (m) {
      const shared = decodeShare(m[1]);
      // Consume the share link so later edits + refresh use localStorage.
      try {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {
        /* ignore */
      }
      if (shared && shared.length) return shared;
    }
  }
  return loadLocal();
}
