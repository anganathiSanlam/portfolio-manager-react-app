import { useApp } from "../../context/AppContext";
import { clientOutcomes } from "../../data";

export default function ClientOutcomes() {
  const { state } = useApp();

  return (
    <div className="client-outcomes">
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Client outcomes</h1>
          <p className="page-heading-sub">On-track / behind status per portfolio against its long-term target. · Sample data</p>
        </div>
      </div>

      <div className="outcome-list">
        {clientOutcomes.map((o) => (
          <div
            key={o.portfolio}
            className={`outcome-card${state.portfolio === o.portfolio ? " selected" : ""}${o.status === "behind" ? " behind" : ""}`}
          >
            <div className="outcome-header">
              <div>
                <div className="outcome-portfolio">{o.portfolio}</div>
                <div className="outcome-target">{o.target}</div>
              </div>
              <span className={`tag ${o.status === "on-track" ? "tag-green" : "tag-red"}`}>
                {o.status === "on-track" ? "On track" : "Behind"}
              </span>
            </div>
            <div className="outcome-metrics">
              <div className="outcome-metric">
                <div className="outcome-metric-label">Target (annualised)</div>
                <div className="outcome-metric-value">{o.targetReturn}</div>
              </div>
              <div className="outcome-metric">
                <div className="outcome-metric-label">Actual (annualised)</div>
                <div className={`outcome-metric-value ${o.status === "on-track" ? "green" : "red"}`}>{o.actualReturn}</div>
              </div>
              <div className="outcome-metric">
                <div className="outcome-metric-label">Gap</div>
                <div className={`outcome-metric-value ${o.status === "on-track" ? "green" : "red"}`}>{o.gap}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
