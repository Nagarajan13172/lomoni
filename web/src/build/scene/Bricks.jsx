import { useBuild } from "../buildStore";
import { Brick } from "./Brick";

/** All placed bricks (with delete-mode hover highlight). */
export function Bricks() {
  const blocks = useBuild((s) => s.blocks);
  const hoverId = useBuild((s) => s.hoverId);
  const mode = useBuild((s) => s.mode);
  return blocks.map((b) => (
    <Brick key={b.id} block={b} hovered={mode === "delete" && hoverId === b.id} />
  ));
}
