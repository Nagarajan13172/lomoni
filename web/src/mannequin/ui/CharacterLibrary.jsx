import { CHARACTERS } from "../character/characters";
import { Thumb } from "./Thumb";
import { useStore } from "../store";

/**
 * Characters tab — swap the rigged model the studio poses. The native wooden
 * mannequin ships in; Mixamo (and other) imports appear here once dropped into
 * public/models/ and registered in character/characters.js.
 */
export function CharacterLibrary() {
  const characterId = useStore((s) => s.characterId);
  const setCharacter = useStore((s) => s.setCharacter);
  const report = useStore((s) => s.characterReport);

  const pick = (c) => {
    if (c.id === characterId) return;
    setCharacter(c.id); // Mannequin reloads + re-rigs; ready flips back on
  };

  return (
    <div className="charlib">
      <div className="poselib__grid">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            className={"posecard" + (characterId === c.id ? " posecard--active" : "")}
            title={c.blurb || c.name}
            onClick={() => pick(c)}
          >
            <span className="posecard__thumb">
              <Thumb src={c.thumb || `/thumbs/characters/${c.id}.png`} emoji={c.icon} alt={c.name} />
            </span>
            <span className="posecard__name">{c.name}</span>
          </button>
        ))}
      </div>

      {report?.missing?.length > 0 && (
        <p className="charlib__warn">
          ⚠ {report.matched.length}/{report.total} bones mapped. Unmapped:{" "}
          {report.missing.join(", ")} — these joints won't pose. Check the
          retarget map for this character.
        </p>
      )}

      <details className="charlib__help">
        <summary>Add a Mixamo character</summary>
        <ol>
          <li>On mixamo.com, pick a character → <b>T-pose</b> → Download as <b>glTF Binary (.glb)</b>.</li>
          <li>Save it into <code>web/public/models/</code>.</li>
          <li>Register it in <code>character/characters.js</code> with <code>retarget: MIXAMO_PROFILE</code>.</li>
        </ol>
        <p>
          Your Mixamo license covers using assets in your project — don't commit
          them to a public repo unless it allows redistribution. Every pose in
          the library drives every character automatically.
        </p>
      </details>
    </div>
  );
}
