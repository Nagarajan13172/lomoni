import { useBuild } from "../buildStore";
import { Brick } from "./Brick";

/** All placed bricks, with a hover highlight for the delete/move pick target. */
export function Bricks() {
  const blocks = useBuild((s) => s.blocks);
  const hoverId = useBuild((s) => s.hoverId);
  const mode = useBuild((s) => s.mode);
  const carried = useBuild((s) => s.carried);

  const highlightFor = (id) => {
    if (hoverId !== id) return null;
    if (mode === "delete") return "delete";
    if (mode === "move" && !carried) return "move";
    return null;
  };

  return blocks.map((b) => <Brick key={b.id} block={b} highlight={highlightFor(b.id)} />);
}
