import { MATERIALS } from "../scene/materials";
import { useStore } from "../store";

export function ModelPanel() {
  const material = useStore((s) => s.material);
  const setMaterial = useStore((s) => s.setMaterial);
  const wireframe = useStore((s) => s.wireframe);
  const setWireframe = useStore((s) => s.setWireframe);
  const showTexture = useStore((s) => s.showTexture);
  const setShowTexture = useStore((s) => s.setShowTexture);
  const opacity = useStore((s) => s.opacity);
  const setOpacity = useStore((s) => s.setOpacity);
  const figureScale = useStore((s) => s.figureScale);
  const setFigureScale = useStore((s) => s.setFigureScale);

  return (
    <div className="modelpanel">
      <section className="section">
        <h2 className="section__title">Material</h2>
        <div className="swatches">
          {MATERIALS.map((m) => (
            <button
              key={m.id}
              className={"swatch" + (material === m.id ? " swatch--active" : "")}
              onClick={() => setMaterial(m.id)}
              title={m.name}
            >
              <span className="swatch__chip" style={{ background: m.color }} />
              <span className="swatch__name">{m.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Display</h2>
        <div className="toolbar__grid">
          <button
            className={"mq-btn" + (wireframe ? " mq-btn--on" : "")}
            onClick={() => setWireframe(!wireframe)}
          >
            {wireframe ? "◉" : "○"} Wireframe
          </button>
          <button
            className={"mq-btn" + (showTexture ? " mq-btn--on" : "")}
            onClick={() => setShowTexture(!showTexture)}
          >
            {showTexture ? "◉" : "○"} Wood grain
          </button>
        </div>

        <div className="slider" style={{ marginTop: 14 }}>
          <div className="slider__top">
            <span className="slider__label">X-ray / opacity</span>
            <span className="slider__val">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
        </div>

        <div className="slider" style={{ marginTop: 14 }}>
          <div className="slider__top">
            <span className="slider__label">Figure scale</span>
            <span className="slider__val">{figureScale.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.8}
            step={0.05}
            value={figureScale}
            onChange={(e) => setFigureScale(Number(e.target.value))}
          />
        </div>
      </section>
    </div>
  );
}
