import { useBuild } from "../buildStore";
import { Brick } from "./Brick";

/** All placed bricks. */
export function Bricks() {
  const blocks = useBuild((s) => s.blocks);
  return blocks.map((b) => <Brick key={b.id} block={b} />);
}
