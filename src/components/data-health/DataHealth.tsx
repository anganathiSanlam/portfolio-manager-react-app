import { useApp } from "../../context/AppContext";
import { pageData } from "../../data";

export default function DataHealth() {
  const { state, dispatch } = useApp();
  const data = pageData["data-health"];

  const feeds = data.rows ?? [];

  function getScore(status: string) {
    if (status === "Fresh" || status === "Reconciled" || status === "Current") return 100;
    if (status.includes("conflict") || status.includes("variance")) return 60;
    if (status.includes("lag")) return 80;
    return 90;
  }

  function getColor(score: number) {
    if (score >= 90) return "green";
    if (score >= 70) return "amber";
    return "red";
  }

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>{data.title}</h1>
          <p className="page-heading-sub">{data.subtitle}</p>
        </div>
        <div className="page-heading-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => dispatch({ type: "ADD_TOAST", message: "Data health report exported" })}
          >
            Export report
          </button>
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

      {data.insight && (
        <div className="why-panel" style={{ marginBottom: 24 }}>
          <div className="why-panel-label">{data.insight[0]}</div>
          <strong>{data.insight[1]}</strong>
          <p style={{ margin: "6px 0 10px" }}>{data.insight[2]}</p>
          {!state.dataHealthResolved && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => dispatch({ type: "RESOLVE_DATA_HEALTH", source: "performance" })}
            >
              {data.insight[3]}
            </button>
          )}
          {state.dataHealthResolved && (
            <span className="tag tag-green">Resolved</span>
          )}
        </div>
      )}

      <div className="data-health-grid">
        {feeds.map((row) => {
          const score = getScore(row[2]);
          const color = getColor(score);
          return (
            <div key={row[0]} className="health-card">
              <div className="health-card-header">
                <span className="health-card-title">{row[0]}</span>
                <span className={`tag tag-${color}`}>{row[2]}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                {row[3]} · as of {row[1]}
              </div>
              <div className={`health-score ${color}`}>{score}</div>
              <div className="health-bar-wrap">
                <div className="health-bar">
                  <div className={`health-bar-fill ${color}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
