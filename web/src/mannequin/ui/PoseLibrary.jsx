import { useMemo, useState } from "react";
import { POSE_LIBRARY, POSE_CATEGORIES } from "../pose/poseLibrary";
import { Thumb } from "./Thumb";
import { useStore } from "../store";

/** Categorised, searchable human-pose library with smooth apply. */
export function PoseLibrary() {
  const ready = useStore((s) => s.ready);
  const queuePose = useStore((s) => s.queuePose);
  const setActivePose = useStore((s) => s.setActivePose);
  const activePoseId = useStore((s) => s.activePoseId);
  const [cat, setCat] = useState(POSE_CATEGORIES[0]);
  const [q, setQ] = useState("");

  const apply = (p) => {
    setActivePose(p.id);
    queuePose(p.renderPose || p.pose, { additive: true });
  };

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query) {
      return POSE_LIBRARY.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.tags || []).some((t) => t.includes(query))
      );
    }
    return POSE_LIBRARY.filter((p) => p.category === cat);
  }, [cat, q]);

  return (
    <div className="poselib">
      <input
        className="search"
        placeholder={`Search ${POSE_LIBRARY.length} poses…`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {!q && (
        <div className="cats">
          {POSE_CATEGORIES.map((c) => (
            <button
              key={c}
              className={"cat" + (c === cat ? " cat--active" : "")}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="poselib__grid">
        {list.map((p) => (
          <button
            key={p.id}
            className={"posecard" + (activePoseId === p.id ? " posecard--active" : "")}
            disabled={!ready}
            title={p.desc || p.name}
            onClick={() => apply(p)}
          >
            <span className="posecard__thumb">
              <Thumb src={`/thumbs/poses/${p.id}.png`} emoji={p.icon} alt={p.name} />
            </span>
            <span className="posecard__name">{p.name}</span>
          </button>
        ))}
        {!list.length && <p className="poselib__empty">No poses match “{q}”.</p>}
      </div>
    </div>
  );
}
