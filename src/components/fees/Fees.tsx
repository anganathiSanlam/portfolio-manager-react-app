import { fundUniverse, pageData } from "../../data";
import { formatRand } from "../../utility/formatters";

const FEE_COLORS = ["#8bc7ac", "#e7c47c", "#7ab8e8", "#df747c", "#a89de6"];

export default function Fees() {
  const data = pageData["fees"];

  const feeFunds = fundUniverse.map((f, i) => ({
    ...f,
    color: FEE_COLORS[i % FEE_COLORS.length],
    feeNum: parseFloat(f.fee) || 0.5,
    aum: 1_250_000_000 * (parseFloat(f.weight) / 100 || 0.2),
  }));

  const totalFee = feeFunds.reduce((s, f) => s + f.feeNum * (parseFloat(f.weight) / 100 || 0.2), 0);

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

      <div className="fees-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Fee breakdown by fund</span></div>
          <div className="fee-breakdown">
            {feeFunds.map((f) => (
              <div key={f.id} className="fee-row">
                <span className="fee-row-label">{f.name}</span>
                <span className="fee-row-value">{f.fee}</span>
              </div>
            ))}
            <div className="fee-row total">
              <span>Weighted average</span>
              <span>{totalFee.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Fee allocation</span></div>
          <div className="fee-chart-wrap">
            <div className="fee-bar">
              {feeFunds.map((f) => (
                <div
                  key={f.id}
                  className="fee-bar-seg"
                  style={{
                    width: `${(f.feeNum / (totalFee * feeFunds.length)) * 100}%`,
                    background: f.color,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="fee-legend">
            {feeFunds.map((f) => (
              <div key={f.id} className="fee-legend-item">
                <span className="fee-legend-dot" style={{ background: f.color }} />
                {f.name}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
            Total AUM: {formatRand(1_250_000_000)}
          </div>
        </div>
      </div>
    </div>
  );
}
