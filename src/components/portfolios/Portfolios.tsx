import { useApp } from "../../context/AppContext";
import { portfolios, portfolioMetrics, portfolioChartData } from "../../data";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import Risk from "../risk/Risk";
import Fees from "../fees/Fees";
import ClientOutcomes from "./ClientOutcomes";
import LineChart from "../common/charts/LineChart";
import DonutChart from "../common/charts/DonutChart";

const TABS = [
  { id: "overview",  label: "Overview" },
  { id: "risk",      label: "Risk & mandates" },
  { id: "fees",      label: "Fees & costs" },
  { id: "outcomes",  label: "Client outcomes" },
];

const ALLOC = [
  { label: "Local equity",  pct: 32, color: "#8bc7ac" },
  { label: "Global equity", pct: 22, color: "#e7c47c" },
  { label: "Local bonds",   pct: 25, color: "#7ab8e8" },
  { label: "Global bonds",  pct: 10, color: "#df747c" },
  { label: "Cash",          pct: 11, color: "#a89de6" },
];

export default function Portfolios() {
  const { state, dispatch } = useApp();
  const tab = useActiveTab("portfolios", "overview");
  const m = portfolioMetrics[state.portfolio];
  const chart = portfolioChartData[state.portfolio];

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Portfolios</h1>
          <p className="page-heading-sub">
            {state.portfolio}
            <span className="sample-data-label">Sample data</span>
          </p>
        </div>
      </div>

      <Tabs page="portfolios" tabs={TABS} />

      {tab === "overview" && (
        <>
          <div className="metric-grid" style={{ marginBottom: 20 }}>
            <div className="metric-card">
              <div className="metric-label">AUM</div>
              <div className="metric-value">{m.aum}</div>
              <div className="metric-delta">{m.aumDelta}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">YTD</div>
              <div className="metric-value">{m.ytd}</div>
              <div className="metric-delta">{m.ytdBench}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">1 month</div>
              <div className="metric-value">{m.return1m}</div>
              <div className="metric-delta">{m.return1d} today</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Equity exposure</div>
              <div className="metric-value">{m.equity}</div>
              <div className="metric-delta">Open actions: {m.openActions}</div>
            </div>
          </div>

          {/* Line chart */}
          {chart && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <span className="card-title">12-month performance</span>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--green)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ display: "inline-block", width: 16, height: 2, background: "var(--green)", borderRadius: 1 }} />
                    Portfolio
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ display: "inline-block", width: 16, height: 2, background: "#4a5568", borderRadius: 1 }} />
                    Benchmark
                  </span>
                </div>
              </div>
              <LineChart portfolio={chart.portfolio} benchmark={chart.benchmark} months={chart.months} />
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

          {/* Donut chart for allocation */}
          <div className="portfolio-detail card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title">Asset allocation — {state.portfolio}</span>
            </div>
            <div className="allocation-donut-wrap">
              <DonutChart
                segments={ALLOC}
                centerLabel={m.equity}
                centerSub="equity"
                size={150}
              />
              <div className="allocation-legend">
                {ALLOC.map((seg) => (
                  <div key={seg.label} className="allocation-legend-item">
                    <span className="allocation-dot" style={{ background: seg.color }} />
                    {seg.label} {seg.pct}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "risk"     && <Risk />}
      {tab === "fees"     && <Fees />}
      {tab === "outcomes" && <ClientOutcomes />}
    </div>
  );
}
