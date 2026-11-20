import { useApp } from "../../context/AppContext";
import { portfolios, portfolioMetrics } from "../../data";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import Risk from "../risk/Risk";
import Fees from "../fees/Fees";
import ClientOutcomes from "./ClientOutcomes";

const TABS = [
  { id: "overview",  label: "Overview" },
  { id: "risk",      label: "Risk & mandates" },
  { id: "fees",      label: "Fees & costs" },
  { id: "outcomes",  label: "Client outcomes" },
];

const ALLOC_COLORS = ["#8bc7ac", "#e7c47c", "#7ab8e8", "#df747c", "#a89de6"];

const ALLOC = [
  { label: "Local equity",  pct: 32 },
  { label: "Global equity", pct: 22 },
  { label: "Local bonds",   pct: 25 },
  { label: "Global bonds",  pct: 10 },
  { label: "Cash",          pct: 11 },
];

export default function Portfolios() {
  const { state, dispatch } = useApp();
  const tab = useActiveTab("portfolios", "overview");
  const m = portfolioMetrics[state.portfolio];

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
          </div>
        </>
      )}

      {tab === "risk"     && <Risk />}
      {tab === "fees"     && <Fees />}
      {tab === "outcomes" && <ClientOutcomes />}
    </div>
  );
}
