import { useApp } from "../../context/AppContext";
import { fundUniverse, pageData } from "../../data";
import { formatRand } from "../../utility/formatters";

export default function Rebalance() {
  const { state, dispatch } = useApp();
  const data = pageData["rebalance"];

  const totalDrift = fundUniverse.reduce((sum, f) => sum + Math.abs(f.excessValue), 0);

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>{data.title}</h1>
          <p className="page-heading-sub">{data.subtitle}</p>
        </div>
        <div className="page-heading-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => dispatch({ type: "ADD_TOAST", message: "Rebalance proposal drafted" })}
          >
            Draft proposal
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

      <div className="rebalance-layout">
        <div>
          <div className="rebalance-funds">
            <div className="rebalance-fund-row" style={{ background: "transparent", border: 0, color: "var(--muted)", fontSize: 11, fontWeight: 600, letterSpacing: ".04em" }}>
              <span>FUND</span>
              <span style={{ textAlign: "right" }}>TARGET</span>
              <span style={{ textAlign: "right" }}>ACTUAL</span>
              <span style={{ textAlign: "right" }}>DRIFT</span>
              <span style={{ textAlign: "right" }}>TRADE</span>
              <span />
            </div>
            {fundUniverse.map((f) => (
              <div key={f.id} className="rebalance-fund-row">
                <div className="rebalance-fund-name">{f.name}</div>
                <div className="rebalance-cell">{f.weight}</div>
                <div className="rebalance-cell">{f.weight}</div>
                <div className={`rebalance-cell${Math.abs(f.excessValue) > 1 ? " amber" : ""}`}>
                  {f.excessValue > 0 ? "+" : ""}{f.excessValue.toFixed(1)}%
                </div>
                <div className="rebalance-cell">{formatRand(Math.abs(f.excessValue) * 12_500_000)}</div>
                <div>
                  <span className={`tag ${Math.abs(f.excessValue) > 2 ? "tag-amber" : "tag-muted"}`}>
                    {Math.abs(f.excessValue) > 2 ? "Review" : "OK"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rebalance-summary">
          <h3>Summary</h3>
          <div className="summary-row">
            <span className="summary-row-label">Total drift</span>
            <span>{totalDrift.toFixed(1)}%</span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Funds to rebalance</span>
            <span>{fundUniverse.filter((f) => Math.abs(f.excessValue) > 2).length}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Estimated trades</span>
            <span>{formatRand(state.rebalanceBondPurchase || 150_000_000)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Status</span>
            <span className="tag tag-amber">{state.rebalanceStage || "Draft"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
