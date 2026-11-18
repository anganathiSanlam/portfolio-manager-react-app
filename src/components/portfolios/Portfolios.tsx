import { useApp } from "../../context/AppContext";
import { portfolios, pageData } from "../../data";
import { formatRand } from "../../utility/formatters";

const ALLOC_COLORS = ["#8bc7ac", "#e7c47c", "#7ab8e8", "#df747c", "#a89de6"];

const ALLOC = [
  { label: "Local equity", pct: 32 },
  { label: "Global equity", pct: 22 },
  { label: "Local bonds", pct: 25 },
  { label: "Global bonds", pct: 10 },
  { label: "Cash", pct: 11 },
];

export default function Portfolios() {
  const { state, dispatch } = useApp();
  const data = pageData["portfolios"];

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>{data.title}</h1>
          <p className="page-heading-sub">{data.subtitle}</p>
        </div>
      </div>

      {data.metrics && (
        <div className="metric-grid">
          {data.metrics.map(([label, value, delta]) => (
            <div key={label} className="metric-card">
              <div className="metric-label">{label}</div>
              <div className="metric-value">{value}</div>
              <div className="metric-delta">{delta}</div>
            </div>
          ))}
        </div>
      )}

      <div className="portfolio-cards">
        {portfolios.map((p) => (
          <div
            key={p.name}
            className={`portfolio-card${state.portfolio === p.name ? " selected" : ""}`}
            onClick={() => dispatch({ type: "SET_PORTFOLIO", name: p.name })}
          >
            <div>
              <div className="portfolio-card-name">{p.name}</div>
              <div className="portfolio-card-aum">{p.meta}</div>
            </div>
            <span className={`tag${state.portfolio === p.name ? " tag-green" : " tag-muted"}`}>
              {state.portfolio === p.name ? "Selected" : "Select"}
            </span>
          </div>
        ))}
      </div>

      <div className="portfolio-detail card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">Asset allocation — {state.portfolio}</span>
        </div>
        <div className="allocation-bar-wrap">
          <div className="allocation-bar">
            {ALLOC.map((seg, i) => (
              <div
                key={seg.label}
                className="allocation-bar-seg"
                style={{ width: `${seg.pct}%`, background: ALLOC_COLORS[i] }}
              />
            ))}
          </div>
        </div>
        <div className="allocation-legend">
          {ALLOC.map((seg, i) => (
            <div key={seg.label} className="allocation-legend-item">
              <span className="allocation-dot" style={{ background: ALLOC_COLORS[i] }} />
              {seg.label} {seg.pct}%
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
          AUM: {formatRand(1_250_000_000)} · Moderate mandate
        </div>
      </div>
    </div>
  );
}
