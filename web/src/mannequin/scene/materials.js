/**
 * Figure material presets. Each is applied to a reusable MeshPhysicalMaterial
 * (a strict superset — clearcoat/sheen cost nothing when 0 — so swap logic is
 * uniform). `keepMap` keeps the baked wood baseColor texture; `keepNormal`
 * keeps the grain normal map. `env` is the base envMapIntensity, later scaled
 * by the active theme.
 */
export const MATERIALS = [
  { id: "wood", name: "Original Wood", icon: "🪵", color: "#ffffff", roughness: 1.0, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.5, env: 0.7, keepMap: true, keepNormal: true },
  { id: "maple", name: "Light Maple", icon: "🟡", color: "#d8c29a", roughness: 0.62, metalness: 0, clearcoat: 0, clearcoatRoughness: 0, env: 0.6, keepMap: false, keepNormal: true },
  { id: "walnut", name: "Walnut", icon: "🟤", color: "#6e4a2e", roughness: 0.5, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.35, env: 0.8, keepMap: true, keepNormal: true },
  { id: "clay", name: "Matte Clay", icon: "⚪", color: "#9e9a90", roughness: 0.95, metalness: 0, clearcoat: 0, clearcoatRoughness: 0, env: 0.35, keepMap: false, keepNormal: true, normalScale: 0.4 },
  { id: "porcelain", name: "Porcelain", icon: "🏺", color: "#f2eee6", roughness: 0.28, metalness: 0, clearcoat: 1.0, clearcoatRoughness: 0.12, env: 1.0, keepMap: false, keepNormal: false },
  { id: "marble", name: "Marble", icon: "🗿", color: "#eceae3", roughness: 0.32, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.25, env: 0.9, keepMap: false, keepNormal: true, normalScale: 0.2 },
  { id: "charcoal", name: "Charcoal", icon: "◼️", color: "#2a2a2d", roughness: 0.82, metalness: 0.08, clearcoat: 0, clearcoatRoughness: 0, env: 0.5, keepMap: false, keepNormal: true },
  { id: "plastic", name: "Black Plastic", icon: "🖤", color: "#121316", roughness: 0.35, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.08, env: 1.0, keepMap: false, keepNormal: false },
  { id: "bronze", name: "Bronze", icon: "🥉", color: "#b08d57", roughness: 0.38, metalness: 1.0, clearcoat: 0, clearcoatRoughness: 0, env: 1.2, keepMap: false, keepNormal: true },
  { id: "terracotta", name: "Terracotta", icon: "🧱", color: "#b15a38", roughness: 0.9, metalness: 0, clearcoat: 0, clearcoatRoughness: 0, env: 0.4, keepMap: false, keepNormal: true },
];

export const getMaterial = (id) => MATERIALS.find((m) => m.id === id) || MATERIALS[0];
