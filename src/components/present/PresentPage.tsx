import { useEffect, useState } from "react";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import SourceBadge from "../common/source-badge/SourceBadge";
import { getTradeZaData, type TradeZaData } from "../../connectors/tradeZa";
import { getPerformanceData, type PerformanceData } from "../../connectors/performanceSystem";
import { getAlphaBetaData, type AlphaBetaData } from "../../connectors/alphaBeta";
import { getClientsData, type Client } from "../../connectors/clients";
import { useApp } from "../../context/AppContext";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import ProgressRing from "../common/charts/ProgressRing";
import DonutChart from "../common/charts/DonutChart";
import "./present.css";

const TABS = [
  { id: "clientstory",  label: "Client story" },
  { id: "whitelabel",   label: "White label" },
  { id: "tradepreview", label: "Trade preview" },
];

export default function PresentPage() {
  const tab = useActiveTab("present", "clientstory");
  const { state, dispatch } = useApp();
  const [trade, setTrade] = useState<TradeZaData | null>(null);
  const [perf, setPerf] = useState<PerformanceData | null>(null);
  const [ab, setAb] = useState<AlphaBetaData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => { getTradeZaData().then(setTrade); }, []);
  useEffect(() => { getPerformanceData().then(setPerf); }, []);
  useEffect(() => { getAlphaBetaData().then(setAb); }, []);
  useEffect(() => { getClientsData().then(d => setClients(d.clients)); }, []);

  const selectedClient = clients.find(c => c.id === state.selectedClientId) ?? null;

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Present</h1>
          <p className="page-heading-sub">Client-ready story and branded exports</p>
        </div>
      </div>

      {/* Client selector */}
      {clients.length > 0 && (
        <div className="present-client-selector">
          <span className="present-client-label">Client</span>
          <select
            className="present-client-select"
            value={state.selectedClientId}
            onChange={e => dispatch({ type: "SET_SELECTED_CLIENT", id: e.target.value })}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selectedClient && (
            <span className="present-client-meta">
              {selectedClient.portfolioType === "model" ? selectedClient.modelPortfolio : "Bespoke mandate"}
              {" · "}{selectedClient.aumDisplay}
            </span>
          )}
        </div>
      )}

      <Tabs page="present" tabs={TABS} />
      {tab === "clientstory"  && <ClientStoryTab trade={trade} perf={perf} ab={ab} selectedClient={selectedClient} />}
      {tab === "whitelabel"   && <WhiteLabelTab  trade={trade} perf={perf} ab={ab} selectedClient={selectedClient} />}
      {tab === "tradepreview" && <TradePreviewTab />}
    </div>
  );
}

/* ─── SHARED STORY CONTENT ───────────────────────────────── */

function StoryContent({
  trade, perf, ab, brandColor, advisorName, logoLabel, selectedClient
}: {
  trade: TradeZaData | null;
  perf: PerformanceData | null;
  ab: AlphaBetaData | null;
  brandColor: string;
  advisorName?: string;
  logoLabel?: string;
  selectedClient?: Client | null;
}) {
  const { state, dispatch } = useApp();

  // If a client is selected and they have a model portfolio, use that; otherwise fall back to state.portfolio
  const portfolio = (selectedClient?.portfolioType === "model" && selectedClient.modelPortfolio)
    ? selectedClient.modelPortfolio
    : state.portfolio;

  const client = trade?.clientOutcomes.find(c => c.portfolio === portfolio) ?? trade?.clientOutcomes[0];
  const portPerf = perf?.portfolios[portfolio];

  if (!client || !portPerf) return <div className="prepare-placeholder">Loading…</div>;

  const actual = client.actualReturn;
  const target = client.targetReturn;
  const onTrack = actual >= target;

  // Allocation donut segments from perf data (simplified)
  const DONUT_SEGMENTS = [
    { label: "SA Equity",     pct: portfolio === "Aggressive portfolio" ? 35 : portfolio === "Conservative portfolio" ? 15 : 25, color: brandColor },
    { label: "Global Equity", pct: portfolio === "Aggressive portfolio" ? 30 : portfolio === "Conservative portfolio" ? 10 : 22, color: "#00B5ED" },
    { label: "SA Bonds",      pct: portfolio === "Aggressive portfolio" ? 10 : portfolio === "Conservative portfolio" ? 32 : 18, color: "#5B6B77" },
    { label: "Other",         pct: portfolio === "Aggressive portfolio" ? 25 : portfolio === "Conservative portfolio" ? 43 : 35, color: "#DCE4EA" },
  ];

  // Why we invest this way — from house view
  const reasons = ab ? [
    ab.houseView.find(h => h.assetClass === "SA Bonds"),
    ab.houseView.find(h => h.assetClass === "SA Equity"),
    ab.houseView.find(h => h.assetClass === "Infrastructure"),
  ].filter(Boolean) : [];

  // Growth chart
  const growthData = portPerf.growthSeries.map(d => ({ ...d, target: d.target }));

  // Fee bar data
  const feeData = portPerf.fees;
  const totalBps = feeData.reduce((s, f) => s + f.bps, 0);

  // Managers in this portfolio
  const PORTFOLIO_MANAGERS: Record<string, { name: string; role: string; reason: string }[]> = {
    "Moderate portfolio": [
      { name: "Northstar Global Equity", role: "Global equity · quality growth", reason: "Provides quality-growth exposure to global leaders; under review for concentration." },
      { name: "Umzi Fixed Income", role: "SA bonds · active duration", reason: "Adds value via active duration; directly benefits from the SA cutting cycle." },
      { name: "Protea SA Equity", role: "SA equity · value", reason: "Genuine value exposure to SA; ahead of benchmark and within mandate." },
    ],
    "Conservative portfolio": [
      { name: "Umzi Fixed Income", role: "SA bonds · active duration", reason: "Core bond exposure, adding value and justified by cutting cycle house view." },
      { name: "Cedar Infrastructure", role: "Infrastructure · real assets", reason: "Inflation-linked cash flows, long duration matching client income needs." },
    ],
    "Aggressive portfolio": [
      { name: "Northstar Global Equity", role: "Global equity · quality growth", reason: "Quality-growth global equities; under review for concentration drift." },
      { name: "Protea SA Equity", role: "SA equity · value", reason: "Value exposure to SA with consistent outperformance." },
    ],
  };

  const managers = PORTFOLIO_MANAGERS[portfolio] ?? PORTFOLIO_MANAGERS["Moderate portfolio"];

  return (
    <div className="story-layout">
      {logoLabel && (
        <div className="story-brand-bar" style={{ background: brandColor }}>
          <span className="story-brand-logo">{logoLabel}</span>
          {advisorName && <span className="story-brand-name">{advisorName}</span>}
        </div>
      )}

      {/* Goal on-track */}
      <div className="card story-goal-card">
        <div className="story-section-label">YOUR GOAL</div>
        <div className="story-goal-row">
          <div className="story-goal-ring">
            <ProgressRing actual={actual} target={target} status={onTrack ? "on-track" : "behind"} size={100} />
          </div>
          <div className="story-goal-text">
            <div className="story-goal-title" style={{ color: brandColor }}>
              {selectedClient?.goalLabel ?? client.goalLabel}
            </div>
            <div className="story-goal-meta">
              {selectedClient?.name ?? client.clientName} · {portfolio}
            </div>
            <div className={`story-goal-status${onTrack ? " on-track" : " behind"}`}>
              {onTrack ? "✓ On track" : "⚠ Behind target"}
            </div>
            <div className="story-goal-detail">
              <span>Actual return <strong>{actual}% p.a.</strong></span>
              <span>Target <strong>{target}% p.a.</strong></span>
              <span>Goal date <strong>{client.goalDate.slice(0, 4)}</strong></span>
            </div>
            {trade && <SourceBadge meta={trade._meta} />}
          </div>
        </div>
      </div>

      {/* How we invest */}
      <div className="story-two-col">
        <div className="card story-alloc-card">
          <div className="story-section-label">HOW YOUR MONEY IS INVESTED</div>
          <div className="story-donut-row">
            <DonutChart segments={DONUT_SEGMENTS} centerLabel={`${portfolio.split(" ")[0]}`} size={140} />
            <div className="story-donut-legend">
              {DONUT_SEGMENTS.map(s => (
                <div key={s.label} className="story-legend-item">
                  <span className="story-legend-dot" style={{ background: s.color }} />
                  <span className="story-legend-label">{s.label}</span>
                  <span className="story-legend-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card story-why-card">
          <div className="story-section-label">WHY WE INVEST THIS WAY</div>
          <div className="story-reasons">
            {reasons.map((r, i) => r && (
              <div key={i} className="story-reason-row">
                <div className="story-reason-num" style={{ background: brandColor }}>{i + 1}</div>
                <div>
                  <div className="story-reason-asset">{r.assetClass}</div>
                  <div className="story-reason-text">{r.reason}</div>
                  <button className="story-reason-link" onClick={() => dispatch({ type: "SET_SECTION_AND_TAB", id: "prepare", tab: "houseview" })}>
                    See house view →
                  </button>
                </div>
              </div>
            ))}
            {ab && <SourceBadge meta={ab._meta} />}
          </div>
        </div>
      </div>

      {/* Manager cards */}
      <div className="card">
        <div className="story-section-label">YOUR MANAGERS</div>
        <div className="story-manager-grid">
          {managers.map(m => (
            <div key={m.name} className="story-manager-card" style={{ borderTopColor: brandColor }}
              onClick={() => dispatch({ type: "SET_SECTION_AND_TAB", id: "research", tab: "profile" })}
            >
              <div className="story-manager-name">{m.name}</div>
              <div className="story-manager-role">{m.role}</div>
              <div className="story-manager-reason">{m.reason}</div>
              <span className="story-manager-link">View profile →</span>
            </div>
          ))}
        </div>
      </div>

      {/* Growth of R100 */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Growth of R100 invested</span>
          {perf && <SourceBadge meta={perf._meta} />}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={growthData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <YAxis tickFormatter={v => `R${v}`} tick={{ fontSize: 11, fill: "var(--text-muted)" }} domain={[90, 115]} />
            <Tooltip formatter={(v) => `R${v}`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="portfolio" name="Portfolio" stroke={brandColor} strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#B0BEC5" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            <Line type="monotone" dataKey="target" name="Target" stroke="var(--warning)" strokeWidth={1.5} strokeDasharray="2 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fee stack */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">What you pay — fee breakdown</span>
          {perf && <SourceBadge meta={perf._meta} />}
        </div>
        <div className="story-fee-row">
          <ResponsiveContainer width={300} height={120}>
            <BarChart data={[{ name: "Total" }]} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 60 }}>
              {feeData.map((f, i) => (
                <Bar key={f.label} dataKey={() => f.bps} name={f.label} stackId="fees"
                  fill={i === 0 ? brandColor : i === 1 ? "#00B5ED" : i === 2 ? "#5B6B77" : "#DCE4EA"}
                />
              ))}
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}bp`} />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip formatter={(v) => `${v}bp`} />
            </BarChart>
          </ResponsiveContainer>
          <div className="story-fee-legend">
            {feeData.map((f, i) => (
              <div key={f.label} className="story-fee-row-item">
                <span className="story-fee-dot" style={{ background: i === 0 ? brandColor : i === 1 ? "#00B5ED" : i === 2 ? "#5B6B77" : "#DCE4EA" }} />
                <span className="story-fee-label">{f.label}</span>
                <span className="story-fee-bps">{f.bps}bp</span>
              </div>
            ))}
            <div className="story-fee-total">Total {totalBps}bp ({(totalBps / 100).toFixed(2)}% p.a.)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CLIENT STORY ───────────────────────────────────────── */

function ClientStoryTab({ trade, perf, ab, selectedClient }: { trade: TradeZaData | null; perf: PerformanceData | null; ab: AlphaBetaData | null; selectedClient: Client | null }) {
  const [presenting, setPresenting] = useState(false);

  return (
    <div>
      <div className="story-topbar">
        <label className="story-presenting-toggle">
          <input type="checkbox" checked={presenting} onChange={e => setPresenting(e.target.checked)} />
          <span>Presenting mode</span>
        </label>
        {presenting && <span className="story-presenting-hint">Sidebar and assistant hidden</span>}
      </div>
      <div className={presenting ? "story-presenting-wrap" : ""}>
        <StoryContent trade={trade} perf={perf} ab={ab} brandColor="var(--brand-primary)" selectedClient={selectedClient} />
      </div>
    </div>
  );
}

/* ─── WHITE LABEL ────────────────────────────────────────── */

function WhiteLabelTab({ trade, perf, ab, selectedClient }: { trade: TradeZaData | null; perf: PerformanceData | null; ab: AlphaBetaData | null; selectedClient: Client | null }) {
  const [brandColor, setBrandColor] = useState("#015376");
  const [advisorName, setAdvisorName] = useState("Advisor Name");
  const [logoText, setLogoText] = useState("Adviser Co");
  const [exported, setExported] = useState(false);

  return (
    <div className="wl-layout">
      <div className="card wl-controls">
        <div className="card-header"><span className="card-title">Brand settings</span></div>
        <div className="wl-control-row">
          <label className="wl-label">Logo / firm name</label>
          <input className="wl-input" value={logoText} onChange={e => setLogoText(e.target.value)} />
        </div>
        <div className="wl-control-row">
          <label className="wl-label">Adviser name</label>
          <input className="wl-input" value={advisorName} onChange={e => setAdvisorName(e.target.value)} />
        </div>
        <div className="wl-control-row">
          <label className="wl-label">Brand colour</label>
          <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="wl-color-picker" />
          <span className="wl-color-val">{brandColor}</span>
        </div>
        <button className="btn-outline" style={{ marginTop: 12 }} onClick={() => { setExported(true); setTimeout(() => setExported(false), 3000); }}>
          {exported ? "Export queued ✓" : "Export branded PDF"}
        </button>
      </div>

      <StoryContent trade={trade} perf={perf} ab={ab} brandColor={brandColor} advisorName={advisorName} logoLabel={logoText} selectedClient={selectedClient} />
    </div>
  );
}

/* ─── TRADE PREVIEW TAB ──────────────────────────────────── */

type ChartType   = "pie" | "bar" | "table";
type Dimension   = "fund" | "assetClass";
type Metric      = "allocationPct" | "valueZAR";

const CHART_COLORS = [
  "#015376","#00B5ED","#1A7D4A","#B25E00","#C0303A",
  "#5B3FA0","#005E7A","#C0421C","#2D7D9A","#4A7F3A",
];

function fmt(v: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency", currency: "ZAR", maximumFractionDigits: 0,
  }).format(v);
}

function TradePreviewTab() {
  const { state } = useApp();
  const { trades } = state;

  const [tradeId,   setTradeId]   = useState<string>(trades[0]?.id ?? "");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [dimension, setDimension] = useState<Dimension>("fund");
  const [metric,    setMetric]    = useState<Metric>("allocationPct");

  const trade = trades.find(t => t.id === tradeId) ?? null;

  /* build chart data */
  type ChartDatum = { name: string; value: number };
  const chartData: ChartDatum[] = !trade ? [] : (() => {
    if (dimension === "fund") {
      return trade.holdings.map(h => ({
        name:  h.fundName.length > 24 ? h.fundName.slice(0, 22) + "…" : h.fundName,
        value: metric === "allocationPct" ? h.allocationPct : h.valueZAR,
      }));
    }
    // group by asset class
    const map = new Map<string, number>();
    trade.holdings.forEach(h => {
      map.set(h.assetClass, (map.get(h.assetClass) ?? 0) + (metric === "allocationPct" ? h.allocationPct : h.valueZAR));
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  })();

  const metricLabel = metric === "allocationPct" ? "Allocation %" : "Value (ZAR)";
  const metricFmt   = (v: number) => metric === "allocationPct" ? `${v.toFixed(1)}%` : fmt(v);

  return (
    <div className="trade-preview-tab">
      {/* Controls */}
      <div className="card trade-preview-controls">
        <div className="tp-control-row">
          <span className="tp-label">Trade</span>
          <select className="tp-select" value={tradeId} onChange={e => setTradeId(e.target.value)}>
            {trades.length === 0 && <option value="">No trades imported yet</option>}
            {trades.map(t => (
              <option key={t.id} value={t.id}>
                {t.reference} · {t.clientName} · {t.tradeDate}
              </option>
            ))}
          </select>
        </div>

        <div className="tp-control-row">
          <span className="tp-label">Chart type</span>
          <div className="tp-toggle-group">
            {(["bar","pie","table"] as ChartType[]).map(c => (
              <button key={c} className={`tp-toggle${chartType === c ? " active" : ""}`}
                onClick={() => setChartType(c)}>
                {c === "bar" ? "📊 Bar" : c === "pie" ? "🥧 Pie" : "📋 Table"}
              </button>
            ))}
          </div>
        </div>

        <div className="tp-control-row">
          <span className="tp-label">Group by</span>
          <div className="tp-toggle-group">
            <button className={`tp-toggle${dimension === "fund" ? " active" : ""}`}
              onClick={() => setDimension("fund")}>By fund</button>
            <button className={`tp-toggle${dimension === "assetClass" ? " active" : ""}`}
              onClick={() => setDimension("assetClass")}>By asset class</button>
          </div>
        </div>

        <div className="tp-control-row">
          <span className="tp-label">Metric</span>
          <div className="tp-toggle-group">
            <button className={`tp-toggle${metric === "allocationPct" ? " active" : ""}`}
              onClick={() => setMetric("allocationPct")}>Allocation %</button>
            <button className={`tp-toggle${metric === "valueZAR" ? " active" : ""}`}
              onClick={() => setMetric("valueZAR")}>Value (ZAR)</button>
          </div>
        </div>
      </div>

      {/* Visualisation */}
      {trade && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {trade.clientName} · {trade.reference}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {metricLabel} · {dimension === "fund" ? "by fund" : "by asset class"}
            </span>
          </div>

          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 42)}>
              <BarChart data={chartData} layout="vertical"
                margin={{ top: 4, right: 60, bottom: 4, left: 180 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickFormatter={metricFmt} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text)" }}
                  width={175} />
                <Tooltip formatter={(v) => [metricFmt(Number(v)), metricLabel]} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === "pie" && (
            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <ResponsiveContainer width={300} height={280}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" cx="50%" cy="50%"
                    outerRadius={110} paddingAngle={2}
                    label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [metricFmt(Number(v)), metricLabel]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="tp-pie-legend">
                {chartData.map((d, i) => (
                  <div key={i} className="tp-legend-row">
                    <span className="tp-legend-dot"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="tp-legend-name">{d.name}</span>
                    <span className="tp-legend-val">{metricFmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chartType === "table" && (
            <table className="holdings-table" style={{ marginTop: 4 }}>
              <thead>
                <tr>
                  <th>{dimension === "fund" ? "Fund" : "Asset class"}</th>
                  <th style={{ textAlign:"right" }}>{metricLabel}</th>
                  {dimension === "fund" && <th>ISIN</th>}
                  {dimension === "fund" && <th>Instruction</th>}
                </tr>
              </thead>
              <tbody>
                {chartData.map((d, i) => {
                  const h = trade.holdings[i];
                  return (
                    <tr key={i}>
                      <td>{d.name}</td>
                      <td style={{ textAlign:"right", fontWeight: 650 }}>{metricFmt(d.value)}</td>
                      {dimension === "fund" && h && (
                        <>
                          <td><span className="holdings-isin">{h.isin}</span></td>
                          <td><span className={`instr-badge ${h.instruction === "Buy" ? "buy" : h.instruction === "Sell" ? "sell" : "switch"}`}>{h.instruction}</span></td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!trade && trades.length === 0 && (
        <div className="card trades-empty">
          <div className="trades-empty-icon">📊</div>
          <div className="trades-empty-title">No trades imported yet</div>
          <div className="trades-empty-sub">
            Go to the Trades page to import a trade sheet, then return here to visualise it.
          </div>
        </div>
      )}
    </div>
  );
}
