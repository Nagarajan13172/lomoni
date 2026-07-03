/**
 * Studio themes — single source of truth for background, lighting, and the
 * shadow system. The shadow architecture (why light theme used to "break"):
 *
 *   - drei <Grid> canNOT receive shadows, so the angled key-light shadow had
 *     nowhere to land — the only floor mark was a black <ContactShadows> blob.
 *   - On a light background that black blob reads as a sticker/hole, and
 *     brightening ambient/env to light the room floods the shadow to white.
 *
 * Fix: a dedicated <shadowMaterial> catcher plane (its darkness is a fixed
 * opacity multiply, immune to room flooding) owns the long angled cast shadow;
 * a TIGHT <ContactShadows> adds only contact-AO at the feet; the key light
 * stays dominant over fill/ambient/env; and the shadow is tinted slate — never
 * pure black — at a lower opacity on light floors.
 *
 * Runtime-safe to change (no shader recompile): background, fog, exposure,
 * light position/intensity/color, shadow colors/opacities, envMapIntensity.
 * NEVER change shadowMap.type or toneMapping TYPE at runtime (recompiles all).
 */
export const THEMES = {
  dark: {
    id: "dark",
    label: "Dark Studio",
    icon: "🌙",
    bg: "#0e1018",
    fogNear: 12,
    fogFar: 26,
    exposure: 1.0,
    envMapIntensity: 0.75,
    key: {
      position: [5, 9, 5],
      intensity: 2.6,
      color: "#fff3e0",
      mapSize: 2048,
      bias: -0.00015,
      normalBias: 0.03,
      radius: 4,
      shadowCam: [-4.8, 4.8, 7.5, -0.5], // left,right,top,bottom
      shadowNear: 0.5,
      shadowFar: 30,
    },
    fill: { position: [-6, 4, -3], intensity: 0.7, color: "#7fb0ff" },
    rim: { position: [0, 3, -8], intensity: 0.9, color: "#ff9e7a" },
    ambient: 0.25,
    hemi: { sky: "#dfe7ff", ground: "#20160f", intensity: 0.55 },
    catcher: { color: "#000000", opacity: 0.48 },
    contact: { color: "#000000", opacity: 0.4, scale: 8, blur: 2.2, far: 1.8 },
    env: [
      { intensity: 2.2, position: [0, 4, -6], scale: [12, 8, 1], color: "#ffffff" },
      { intensity: 1.1, position: [-5, 2, 2], scale: [6, 6, 1], color: "#9db9ff" },
      { intensity: 1.1, position: [5, 2, 2], scale: [6, 6, 1], color: "#ffd9a8" },
    ],
    floor: "grid",
    grid: { cellColor: "#2a2f42", sectionColor: "#3d4f65" },
    solid: "#171a24",
    ui: "dark",
  },
  light: {
    id: "light",
    label: "Light Studio",
    icon: "☀️",
    bg: "#e9eaee", // not pure white — leaves headroom for shadow/spec
    fogNear: 16,
    fogFar: 34,
    exposure: 0.95, // ACES lifts shadows; nudge down to keep the shadow foot dark
    envMapIntensity: 0.9,
    key: {
      position: [5.5, 8, 4.5],
      intensity: 3.4, // punch through the brighter room, keep shadow contrast
      color: "#fffaf2",
      mapSize: 2048,
      bias: -0.00015,
      normalBias: 0.03,
      radius: 3.5,
      shadowCam: [-4.8, 4.8, 7.5, -0.5],
      shadowNear: 0.5,
      shadowFar: 30,
    },
    fill: { position: [-6, 4, -3], intensity: 0.55, color: "#cdd8ff" },
    rim: { position: [0, 3, -8], intensity: 0.8, color: "#ffd0b0" },
    ambient: 0.35,
    hemi: { sky: "#ffffff", ground: "#c8ccd6", intensity: 0.5 },
    catcher: { color: "#1b2230", opacity: 0.3 }, // slate, not black
    contact: { color: "#232a36", opacity: 0.22, scale: 8, blur: 2.2, far: 1.8 },
    env: [
      { intensity: 1.6, position: [0, 5, -5], scale: [14, 9, 1], color: "#ffffff" },
      { intensity: 0.9, position: [-6, 3, 3], scale: [7, 7, 1], color: "#eef2ff" },
      { intensity: 0.9, position: [6, 3, 3], scale: [7, 7, 1], color: "#fff2e2" },
    ],
    floor: "solid",
    grid: { cellColor: "#c9ccd6", sectionColor: "#b3b7c4" },
    solid: "#dfe1e8",
    ui: "light",
  },
  blueprint: {
    id: "blueprint",
    label: "Blueprint",
    icon: "📐",
    bg: "#0b2f6b",
    fogNear: 10,
    fogFar: 30,
    exposure: 1.05,
    envMapIntensity: 0.8,
    key: {
      position: [4, 9, 6],
      intensity: 2.8,
      color: "#dbe8ff",
      mapSize: 2048,
      bias: -0.00015,
      normalBias: 0.03,
      radius: 4,
      shadowCam: [-4.8, 4.8, 7.5, -0.5],
      shadowNear: 0.5,
      shadowFar: 30,
    },
    fill: { position: [-6, 4, -3], intensity: 0.6, color: "#3f6bd0" },
    rim: { position: [0, 3, -8], intensity: 0.7, color: "#8fd0ff" },
    ambient: 0.3,
    hemi: { sky: "#bcd4ff", ground: "#0a1f4d", intensity: 0.5 },
    catcher: { color: "#04122f", opacity: 0.42 },
    contact: { color: "#06152f", opacity: 0.35, scale: 8, blur: 2.2, far: 1.8 },
    env: [
      { intensity: 2.0, position: [0, 4, -6], scale: [12, 8, 1], color: "#cfe0ff" },
      { intensity: 1.0, position: [-5, 2, 2], scale: [6, 6, 1], color: "#5b8bff" },
      { intensity: 1.0, position: [5, 2, 2], scale: [6, 6, 1], color: "#8fd0ff" },
    ],
    floor: "grid",
    grid: { cellColor: "#173f83", sectionColor: "#2f63b8" },
    solid: "#0d3576",
    ui: "dark",
  },
};

export const THEME_LIST = Object.values(THEMES);
export const getTheme = (id) => THEMES[id] || THEMES.dark;
