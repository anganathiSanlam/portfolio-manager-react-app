import { useApp } from "../../context/AppContext";
import { pageData } from "../../data";

const SECTION_ICONS: Record<string, string> = {
  committee: "🏛",
  reporting: "📊",
  agents: "🤖",
};

export default function GenericPage() {
  const { state } = useApp();
  const data = pageData[state.activeSection];

  if (!data) {
    return (
      <div className="generic-page">
        <h1>{state.activeSection}</h1>
        <p className="generic-page-lead">Coming soon.</p>
      </div>
    );
  }

  return (
    <div className="generic-page">
      <div className="generic-page-icon">{SECTION_ICONS[state.activeSection] ?? "📄"}</div>
      {data.eyebrow && (
        <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: ".1em", color: "var(--muted)", marginBottom: 6 }}>
          {data.eyebrow}
        </div>
      )}
      <h1>{data.title}</h1>
      <p className="generic-page-lead">{data.subtitle}</p>

      {data.metrics && (
        <div className="metric-grid" style={{ marginBottom: 24 }}>
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
          <p style={{ margin: "6px 0 0" }}>{data.insight[2]}</p>
        </div>
      )}

      {data.tableTitle && data.rows && data.columns && (
        <>
          <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 10 }}>{data.tableTitle}</div>
          <div className="table-wrap">
            <table className="generic-table">
              <thead>
                <tr>{data.columns.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
