// ──────────────────────────────────────────────────────────────────────────
// Picking a viewpoint to draw from.
//
// Shared by the Shapes studio and the Pose studio: both want to swing the camera
// to a three-quarter angle that is lit across rather than head-on, and both want
// the shorter way round to get there. One implementation, one set of tests.
// ──────────────────────────────────────────────────────────────────────────

/** Unsigned angle between two bearings, 0–180°. */
export function bearingGap(a, b) {
  return Math.abs(((((a - b) % 360) + 540) % 360) - 180);
}

/** Bearing + height angle → a unit direction (bearing 0 looks along +Z). */
export function directionFromAngles(azimuthDeg, elevationDeg) {
  const a = (azimuthDeg * Math.PI) / 180;
  const e = (elevationDeg * Math.PI) / 180;
  return [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)];
}

/**
 * Choose a viewpoint from `candidates`.
 *
 * Lighting decides it: we want the key roughly side-on, because a light square
 * behind the camera flattens every form and hides the cast shadow behind its own
 * object. Opposite bearings are lit equally well, though — 35° and 215° are both
 * square to a light at 125° — so ties go to whichever is the shorter turn from
 * where the camera already is. Without that the view flips a pointless 180° half
 * the time.
 */
export function pickBearing(candidates, lightBearing, cameraBearing = null) {
  let best = candidates[0];
  let bestScore = Infinity;
  for (const bearing of candidates) {
    const lit = Math.abs(bearingGap(bearing, lightBearing) - 90);
    const turn = cameraBearing == null ? 0 : bearingGap(bearing, cameraBearing) / 180;
    const score = lit * 4 + turn; // lighting dominates, turn only breaks ties
    if (score < bestScore) {
      bestScore = score;
      best = bearing;
    }
  }
  return best;
}
