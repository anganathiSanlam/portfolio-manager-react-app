import { useApp } from "../../context/AppContext";
import { pageData } from "../../data";
import { formatPercent } from "../../utility/formatters";

const SCENARIOS = [
  { id: "base", label: "Base case", shock: 0 },
  { id: "mild", label: "Mild correction", shock: -8 },
  { id: "moderate", label: "Moderate stress", shock: -15 },
  { id: "severe", label: "Severe stress", shock: -25 },
];

export default function Risk() {
  const { state, dispatch } = useApp();
  const data = pageData["risk"];

  const activeScenario = SCENARIOS.find((s) => s.id === state.riskScenario) ?? SCENARIOS[0];
  const riskScore = 62;

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

      <div className="risk-layout">
        <div className="card">
          <div className="card-header"><span className="card-title">Risk score</span></div>
          <div className="risk-band-wrap">
            <div className="risk-band">
              <div className="risk-band-marker" style={{ left: `${riskScore}%` }} />
            </div>
            <div className="risk-band-labels">
              <span>Low</span><span>Medium</span><span>High</span>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 24, fontWeight: 680 }}>{riskScore} / 100</div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            Within mandate band. Last checked 08:02.
          </p>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Stress scenarios</span></div>
          <div className="mandate-grid">
            {SCENARIOS.map((s) => (
              <div
                key={s.id}
                className={`mandate-row${state.riskScenario === s.id ? " selected" : ""}`}
                onClick={() => dispatch({ type: "SET_RISK_SCENARIO", scenario: s.id, shock: s.shock })}
                style={{ cursor: "pointer", borderRadius: 8 }}
              >
                <span className="mandate-label">{s.label}</span>
                <span className={`mandate-value${s.shock < -20 ? " red" : s.shock < -10 ? " amber" : ""}`}
                  style={{ color: s.shock < -20 ? "var(--red)" : s.shock < -10 ? "var(--amber)" : "var(--green)" }}>
                  {s.shock === 0 ? "—" : formatPercent(s.shock)}
                </span>
              </div>
            ))}
          </div>
          {activeScenario.shock !== 0 && (
            <div className="why-panel" style={{ marginTop: 12 }}>
              <div className="why-panel-label">Scenario impact</div>
              Portfolio would fall by approximately {formatPercent(activeScenario.shock)} under {activeScenario.label.toLowerCase()} conditions.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><span className="card-title">Mandate checks</span></div>
        <div className="breach-list">
          {(data.rows ?? []).map((row, i) => (
            <div key={i} className={`breach-item${row[2] === "Pass" ? "" : " warning"}`}>
              <div>
                <div style={{ fontWeight: 600 }}>{row[0]}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{row[1]}</div>
              </div>
              <span className={`tag ${row[2] === "Pass" ? "tag-green" : "tag-amber"}`} style={{ marginLeft: "auto" }}>{row[2]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
