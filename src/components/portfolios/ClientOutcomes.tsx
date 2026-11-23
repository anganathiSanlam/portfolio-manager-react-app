import { useApp } from "../../context/AppContext";
import { clientOutcomes } from "../../data";
import ProgressRing from "../common/charts/ProgressRing";

export default function ClientOutcomes() {
  const { state } = useApp();

  return (
    <div className="client-outcomes">
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Client outcomes</h1>
          <p className="page-heading-sub">
            On-track / behind status per portfolio against its long-term target.
            <span className="sample-data-label">Sample data</span>
          </p>
        </div>
      </div>

      <div className="outcome-list">
        {clientOutcomes.map((o) => {
          const actual = parseFloat(o.actualReturn);
          const target = parseFloat(o.targetReturn);
          return (
            <div
              key={o.portfolio}
              className={`outcome-card${state.portfolio === o.portfolio ? " selected" : ""}${o.status === "behind" ? " behind" : ""}`}
            >
              <div className="outcome-ring-col">
                <ProgressRing actual={actual} target={target} status={o.status} size={80} />
              </div>
              <div className="outcome-info-col">
                <div className="outcome-header">
                  <div>
                    <div className="outcome-portfolio">{o.portfolio}</div>
                    <div className="outcome-target">{o.target}</div>
                  </div>
                  <span className={`tag ${o.status === "on-track" ? "tag-green" : "tag-red"}`}>
                    {o.status === "on-track" ? "On track" : "Behind"}
                  </span>
                </div>
                <div className="outcome-stats-row">
                  <div className="outcome-stat">
                    <div className="outcome-stat-label">Target</div>
                    <div className="outcome-stat-value">{o.targetReturn}</div>
                  </div>
                  <div className="outcome-stat">
                    <div className="outcome-stat-label">Actual</div>
                    <div className={`outcome-stat-value ${o.status === "on-track" ? "green" : "red"}`}>{o.actualReturn}</div>
                  </div>
                  <div className="outcome-stat">
                    <div className="outcome-stat-label">Gap</div>
                    <div className={`outcome-stat-value ${o.status === "on-track" ? "green" : "red"}`}>{o.gap}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
