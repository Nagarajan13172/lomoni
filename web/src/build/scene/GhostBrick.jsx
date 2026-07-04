import { useBuild } from "../buildStore";
import { Brick } from "./Brick";

/** Translucent preview of the brick about to be dropped, at its resting layer. */
export function GhostBrick() {
  const ghost = useBuild((s) => s.ghost);
  const type = useBuild((s) => s.type);
  const rot = useBuild((s) => s.rot);
  const color = useBuild((s) => s.color);
  const restingY = useBuild((s) => s.restingY);
  if (!ghost) return null;
  const gy = restingY(ghost.gx, ghost.gz, type, rot);
  return (
    <Brick
      block={{ id: "ghost", type, gx: ghost.gx, gy, gz: ghost.gz, rot, color }}
      ghost
    />
  );
}
