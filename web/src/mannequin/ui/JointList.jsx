import { useMemo } from "react";
import { JOINTS, useStore } from "../store";

export function JointList() {
  const selected = useStore((s) => s.selected);
  const select = useStore((s) => s.select);
  const ready = useStore((s) => s.ready);

  const groups = useMemo(() => {
    const g = {};
    for (const j of JOINTS) (g[j.group] ||= []).push(j);
    return Object.entries(g);
  }, []);

  return (
    <div className="joints">
      {groups.map(([group, items]) => (
        <div className="joints__group" key={group}>
          <div className="joints__group-title">{group}</div>
          <div className="joints__row">
            {items.map((j) => (
              <button
                key={j.name}
                className={
                  "chip" + (selected === j.name ? " chip--active" : "")
                }
                disabled={!ready}
                onClick={() => select(j.name)}
                title={j.hint || j.label}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
