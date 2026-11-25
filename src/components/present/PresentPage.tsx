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
  BarChart, Bar
} from "recharts";
import ProgressRing from "../common/charts/ProgressRing";
import DonutChart from "../common/charts/DonutChart";
import "./present.css";

const TABS = [
  { id: "clientstory", label: "Client story" },
  { id: "whitelabel",  label: "White label" },
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
      {tab === "clientstory" && <ClientStoryTab trade={trade} perf={perf} ab={ab} selectedClient={selectedClient} />}
      {tab === "whitelabel"  && <WhiteLabelTab trade={trade} perf={perf} ab={ab} selectedClient={selectedClient} />}
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
