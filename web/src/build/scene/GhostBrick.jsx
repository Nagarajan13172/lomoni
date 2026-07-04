import { useBuild } from "../buildStore";
import { Brick } from "./Brick";

/** Translucent preview of the brick about to be dropped, at its resting layer. */
export function GhostBrick() {
  const ghost = useBuild((s) => s.ghost);
  const type = useBuild((s) => s.type);
  const rot = useBuild((s) => s.rot);
  const color = useBuild((s) => s.color);
  const mode = useBuild((s) => s.mode);
  const carried = useBuild((s) => s.carried);
  const restingY = useBuild((s) => s.restingY);

  if (!ghost || mode === "delete") return null;
  if (mode === "move" && !carried) return null; // nothing to preview until picked up

  // While moving, preview the carried brick; otherwise the palette piece.
  const piece = carried || { type, rot, color };
  const gy = restingY(ghost.gx, ghost.gz, piece.type, piece.rot);
  return (
    <Brick
      block={{ id: "ghost", type: piece.type, gx: ghost.gx, gy, gz: ghost.gz, rot: piece.rot, color: piece.color }}
      ghost
    />
  );
}
