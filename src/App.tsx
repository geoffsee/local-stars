import { useMemo, useState } from "react";
import { StarMap } from "./components/StarMap";
import { placeStars, type PlacedStar } from "./data/nearbyStars";
import "./index.css";

export function App() {
  const [maxDistance, setMaxDistance] = useState(20);
  const [showLabels, setShowLabels] = useState(true);
  const [showRings, setShowRings] = useState(true);
  const [showLinks, setShowLinks] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selected, setSelected] = useState<PlacedStar | null>(null);

  const allStars = useMemo(() => placeStars(), []);
  const visibleCount = useMemo(
    () => allStars.filter((s) => s.id === "sun" || s.distanceLy <= maxDistance).length,
    [allStars, maxDistance],
  );

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">☉</span>
          <div>
            <h1>Local Stars</h1>
            <p className="subtitle">
              The Sun and its stellar neighborhood — distances to scale
            </p>
          </div>
        </div>
        <div className="stats">
          <span>
            <strong>{visibleCount}</strong> stars
          </span>
          <span className="sep">·</span>
          <span>
            within <strong>{maxDistance}</strong> ly
          </span>
        </div>
      </header>

      <main className="viewport">
        <StarMap
          maxDistance={maxDistance}
          showLabels={showLabels}
          showRings={showRings}
          showLinks={showLinks}
          autoRotate={autoRotate}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />

        <aside className="controls panel">
          <h2>Controls</h2>

          <label className="control">
            <span>Radius (ly)</span>
            <div className="slider-row">
              <input
                type="range"
                min={5}
                max={25}
                step={1}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
              />
              <span className="value">{maxDistance}</span>
            </div>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            <span>Star labels</span>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={showRings}
              onChange={(e) => setShowRings(e.target.checked)}
            />
            <span>Distance rings</span>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={showLinks}
              onChange={(e) => setShowLinks(e.target.checked)}
            />
            <span>Lines to Sun</span>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
            />
            <span>Auto-rotate</span>
          </label>

          <div className="hint">
            <p>Drag to orbit · Scroll to zoom · Click a star for details</p>
          </div>

          <div className="scale-note">
            <h3>About scale</h3>
            <p>
              <strong>Distances</strong> are true to scale (1 unit = 1 light-year).
              Star <strong>sizes</strong> are exaggerated — at true scale every star
              would be smaller than a pixel at these distances.
            </p>
            <p>
              Colors follow spectral type: blue-white (A/F), yellow (G), orange (K),
              red (M).
            </p>
          </div>
        </aside>

        {selected && (
          <aside className="detail panel">
            <button
              type="button"
              className="close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div
              className="swatch"
              style={{ background: selected.color, boxShadow: `0 0 20px ${selected.color}` }}
            />
            <h2>{selected.name}</h2>
            <dl>
              <div>
                <dt>Distance</dt>
                <dd>
                  {selected.id === "sun"
                    ? "—"
                    : `${selected.distanceLy.toFixed(2)} light-years`}
                </dd>
              </div>
              <div>
                <dt>Spectral type</dt>
                <dd>{selected.spectralType}</dd>
              </div>
              <div>
                <dt>Abs. magnitude</dt>
                <dd>{selected.absMag.toFixed(2)}</dd>
              </div>
              {selected.id !== "sun" && (
                <div>
                  <dt>Coordinates</dt>
                  <dd className="mono">
                    RA {formatRA(selected.raHours)}
                    <br />
                    Dec {formatDec(selected.decDeg)}
                  </dd>
                </div>
              )}
              {selected.id !== "sun" && (
                <div>
                  <dt>Position (ly)</dt>
                  <dd className="mono">
                    [{selected.position.map((v) => v.toFixed(2)).join(", ")}]
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        )}
      </main>

      <footer className="legend">
        <span className="legend-item">
          <i style={{ background: "#fff4ea" }} /> G (Sun-like)
        </span>
        <span className="legend-item">
          <i style={{ background: "#ffd2a1" }} /> K (orange dwarf)
        </span>
        <span className="legend-item">
          <i style={{ background: "#ffcc6f" }} /> M (red dwarf)
        </span>
        <span className="legend-item">
          <i style={{ background: "#cad7ff" }} /> A/F (hotter)
        </span>
        <span className="legend-item muted">
          Rings at 5 · 10 · 15 · 20 light-years
        </span>
      </footer>
    </div>
  );
}

function formatRA(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = ((hours - h) * 60 - m) * 60;
  return `${h}h ${m}m ${s.toFixed(1)}s`;
}

function formatDec(deg: number): string {
  const sign = deg >= 0 ? "+" : "−";
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d) * 60 - m) * 60;
  return `${sign}${d}° ${m}′ ${s.toFixed(0)}″`;
}

export default App;
