import { useBuild } from "../buildStore";

/** A gentle onboarding card, shown over the scene until the first brick lands. */
export function BuildHint() {
  const count = useBuild((s) => s.blocks.length);
  if (count) return null;
  return (
    <div className="build-hintcard">
      <div className="build-hintcard__emoji">🧱</div>
      <p className="build-hintcard__text">
        Click the green baseplate
        <br /> to place your first brick!
      </p>
      <p className="build-hintcard__sub">Drag to spin · scroll to zoom</p>
    </div>
  );
}
