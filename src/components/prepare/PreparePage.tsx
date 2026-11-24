import { useEffect, useState } from "react";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import SourceBadge from "../common/source-badge/SourceBadge";
import { getMacroData, type MacroData, type MacroIndicator } from "../../connectors/tradingEconomics";
import { getAlphaBetaData, type AlphaBetaData, type HouseViewRow, type TAARow } from "../../connectors/alphaBeta";
import { getPortfolioBuilderData, type PortfolioBuilderData } from "../../connectors/portfolioBuilder";
import { useApp } from "../../context/AppContext";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, CartesianGrid, Legend,
  ScatterChart, Scatter
} from "recharts";
import "./prepare.css";

const TABS = [
  { id: "macro",      label: "Macro" },
  { id: "houseview",  label: "House view" },
  { id: "allocation", label: "Asset allocation" },
  { id: "monday",     label: "Monday pack" },
];

export default function PreparePage() {
  const tab = useActiveTab("prepare", "macro");
  const [macro, setMacro] = useState<MacroData | null>(null);
  const [ab, setAb] = useState<AlphaBetaData | null>(null);
  const [pb, setPb] = useState<PortfolioBuilderData | null>(null);

  useEffect(() => { getMacroData().then(setMacro); }, []);
  useEffect(() => { getAlphaBetaData().then(setAb); }, []);
  useEffect(() => { getPortfolioBuilderData().then(setPb); }, []);

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Prepare</h1>
          <p className="page-heading-sub">Daily brief, house view and Monday pack</p>
        </div>
      </div>
      <Tabs page="prepare" tabs={TABS} />
      {tab === "macro"      && <MacroTab data={macro} />}
      {tab === "houseview"  && <HouseViewTab data={ab} />}
      {tab === "allocation" && <AllocationTab data={pb} />}
      {tab === "monday"     && <MondayPackTab abData={ab} />}
    </div>
  );
}

/* ─── MACRO TAB ─────────────────────────────────────────── */

interface CustomIndicator {
  id: string;
  region: string;
  label: string;
  value: string;
  unit: string;
  weeklyChange: string;
  trend: number[];
}

function trendColor(change: number) {
  if (change > 0) return "var(--negative)";
  if (change < 0) return "var(--positive)";
  return "var(--text-muted)";
}

function IndicatorSparkline({ values }: { values: number[] }) {
  const data = values.map((v, i) => ({ i, v }));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.2 || 0.1;
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <Line type="monotone" dataKey="v" stroke="var(--brand-accent)" strokeWidth={1.5} dot={false} />
        <YAxis domain={[min - pad, max + pad]} hide />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MacroTab({ data }: { data: MacroData | null }) {
  const [customIndicators, setCustomIndicators] = useState<CustomIndicator[]>(() => {
    try { return JSON.parse(localStorage.getItem("macro-custom-indicators") || "[]"); } catch { return []; }
  });
  const [openFormRegion, setOpenFormRegion] = useState<string | null>(null);
  const [formData, setFormData] = useState({ label: "", value: "", unit: "", weeklyChange: "", trend: "" });

  if (!data) return <div className="prepare-placeholder">Loading…</div>;

  function handleAddIndicator(region: string) {
    if (!formData.label.trim() || !formData.value.trim()) return;
    const trendNums = formData.trend.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const ci: CustomIndicator = {
      id: String(Date.now()),
      region,
      label: formData.label.trim(),
      value: formData.value.trim(),
      unit: formData.unit.trim(),
      weeklyChange: formData.weeklyChange.trim(),
      trend: trendNums.length >= 2 ? trendNums : [],
    };
    const updated = [...customIndicators, ci];
    setCustomIndicators(updated);
    try { localStorage.setItem("macro-custom-indicators", JSON.stringify(updated)); } catch {}
    setFormData({ label: "", value: "", unit: "", weeklyChange: "", trend: "" });
    setOpenFormRegion(null);
  }

  function deleteCustom(id: string) {
    const updated = customIndicators.filter(c => c.id !== id);
    setCustomIndicators(updated);
    try { localStorage.setItem("macro-custom-indicators", JSON.stringify(updated)); } catch {}
  }

  const groups: Array<{ region: string; items: MacroIndicator[] }> = [
    { region: "United States", items: data.indicators.filter(i => i.region === "US") },
    { region: "South Africa",  items: data.indicators.filter(i => i.region === "SA") },
    { region: "Global",        items: data.indicators.filter(i => i.region === "Global") },
  ];

  return (
    <div className="macro-layout">
      {/* Indicator cards */}
      {groups.map(g => (
        <div key={g.region} className="macro-region-block">
          <div className="macro-region-header">
            <div className="macro-region-label">{g.region}</div>
            <button
              className="macro-add-btn"
              onClick={() => {
                setOpenFormRegion(openFormRegion === g.region ? null : g.region);
                setFormData({ label: "", value: "", unit: "", weeklyChange: "", trend: "" });
              }}
            >
              {openFormRegion === g.region ? "✕ Cancel" : "+ Add indicator"}
            </button>
          </div>
          {openFormRegion === g.region && (
            <div className="macro-inline-form card">
              <div className="macro-form-grid">
                <div className="macro-form-field">
                  <label className="macro-form-label">Name *</label>
                  <input className="macro-form-input" value={formData.label} onChange={e => setFormData(f => ({ ...f, label: e.target.value }))} placeholder="e.g. US PMI" />
                </div>
                <div className="macro-form-field">
                  <label className="macro-form-label">Value *</label>
                  <input className="macro-form-input" value={formData.value} onChange={e => setFormData(f => ({ ...f, value: e.target.value }))} placeholder="52.1" />
                </div>
                <div className="macro-form-field">
                  <label className="macro-form-label">Unit</label>
                  <input className="macro-form-input" value={formData.unit} onChange={e => setFormData(f => ({ ...f, unit: e.target.value }))} placeholder="%" />
                </div>
                <div className="macro-form-field">
                  <label className="macro-form-label">Weekly change</label>
                  <input className="macro-form-input" value={formData.weeklyChange} onChange={e => setFormData(f => ({ ...f, weeklyChange: e.target.value }))} placeholder="+0.3pp" />
                </div>
              </div>
              <div className="macro-form-field macro-form-full">
                <label className="macro-form-label">Trend (8 numbers, comma-separated — optional)</label>
                <input className="macro-form-input" value={formData.trend} onChange={e => setFormData(f => ({ ...f, trend: e.target.value }))} placeholder="51.1, 51.5, 51.8, 52.0, 51.9, 52.1, 52.3, 52.1" />
              </div>
              <div className="macro-form-actions">
                <button className="btn-outline" onClick={() => handleAddIndicator(g.region)}>Add indicator</button>
                <button className="btn-ghost-sm" onClick={() => setOpenFormRegion(null)}>Cancel</button>
              </div>
            </div>
          )}
          <div className="macro-indicator-grid">
            {g.items.map(ind => (
              <div key={ind.id} className="macro-indicator-card">
                <div className="macro-ind-label">{ind.label}</div>
                <div className="macro-ind-value">
                  {ind.value}{ind.unit}
                  {ind.targetLine !== undefined && (
                    <span className="macro-target-label"> (target {ind.targetLine}{ind.unit})</span>
                  )}
                </div>
                <div className="macro-ind-change" style={{ color: trendColor(ind.change) }}>
                  {ind.change > 0 ? "▲" : ind.change < 0 ? "▼" : "—"} {ind.changeLabel}
                </div>
                <div className="macro-ind-spark">
                  <IndicatorSparkline values={ind.trend} />
                </div>
              </div>
            ))}
            {customIndicators.filter(ci => ci.region === g.region).map(ci => (
              <div key={ci.id} className="macro-indicator-card macro-custom-card">
                <div className="macro-custom-header">
                  <span className="macro-ind-label">{ci.label}</span>
                  <button className="macro-custom-delete" onClick={() => deleteCustom(ci.id)}>×</button>
                </div>
                <div className="macro-ind-value">{ci.value}{ci.unit}</div>
                {ci.weeklyChange && <div className="macro-ind-change">{ci.weeklyChange}</div>}
                {ci.trend.length > 0 && <div className="macro-ind-spark"><IndicatorSparkline values={ci.trend} /></div>}
                <span className="macro-custom-tag">custom</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Inflation chart */}
      <div className="macro-chart-card card">
        <div className="card-header">
          <span className="card-title">Inflation vs target</span>
          <SourceBadge meta={data._meta} />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.inflationSeries} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={v => `${v}%`} domain={[0, 7]} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={2.0} stroke="var(--warning)" strokeDasharray="4 2" label={{ value: "US target 2%", position: "right", fontSize: 10, fill: "var(--warning)" }} />
            <ReferenceLine y={4.5} stroke="var(--brand-accent)" strokeDasharray="4 2" label={{ value: "SA midpoint 4.5%", position: "right", fontSize: 10, fill: "var(--brand-accent)" }} />
            <Line type="monotone" dataKey="usActual" name="US CPI" stroke="var(--warning)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="saActual" name="SA CPI" stroke="var(--brand-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* What changed this week */}
      <div className="macro-news-card card">
        <div className="card-header">
          <span className="card-title">What changed this week</span>
        </div>
        <div className="macro-changes-list">
          {[
            { icon: "↓", color: "var(--positive)", text: "SA repo rate cut 25bp to 7.75% — third consecutive cut." },
            { icon: "↓", color: "var(--positive)", text: "SA inflation fell to 3.8% — lowest since 2021." },
            { icon: "↓", color: "var(--positive)", text: "Brent crude −$1.8 to $72.4 — easing cost pressure." },
            { icon: "→", color: "var(--text-muted)", text: "Fed held at 4.5%. Next meeting 18 December." },
            { icon: "↓", color: "var(--positive)", text: "SA 10-year yield fell 12bp to 9.85% — rate-cut support." },
          ].map((c, i) => (
            <div key={i} className="macro-change-row">
              <span className="macro-change-icon" style={{ color: c.color }}>{c.icon}</span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── TAA CHART ──────────────────────────────────────────── */

function retCell(v: number, key: string) {
  const cls = v >= 8 ? "ret-strong" : v > 0 ? "ret-pos" : "ret-neg";
  return <td key={key} className={`taa-returns-cell ${cls}`}>{v > 0 ? "+" : ""}{v.toFixed(1)}</td>;
}

function TAAChart({ rows }: { rows: TAARow[] }) {
  const toP = (v: number) => `${((v + 2) / 4) * 100}%`;
  const YEARS = ["2018","2019","2020","2021","2022","2023","2024","2025"];

  return (
    <div className="taa-two-col">
      {/* Left: Positioning chart */}
      <div className="card">
        <div className="card-header"><span className="card-title">Global TAA positioning</span></div>
        <div className="taa-axis-wrapper">
          <div className="taa-axis-spacer" />
          <div className="taa-axis-track">
            {["-2","-1","0","+1","+2"].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>
        <div className="taa-chart">
          {rows.map(row => (
            <div key={row.assetClass} className="taa-row">
              <div className="taa-row-label">{row.assetClass}</div>
              <div className="taa-track">
                <div className="taa-center-line" />
                <div className="taa-box" style={{
                  left: toP(row.currentMin),
                  width: `${((row.currentMax - row.currentMin) / 4) * 100}%`,
                }} />
                <div className="taa-triangle" style={{ left: toP(row.forwardView) }} />
              </div>
            </div>
          ))}
        </div>
        <div className="taa-legend">
          <span className="taa-legend-box" /> Current positioning
          <span className="taa-legend-tri">▼</span> 6–12m view
        </div>
      </div>

      {/* Right: Historical returns table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header"><span className="card-title">Historical returns (%)</span></div>
        <div style={{ overflowX: "auto" }}>
          <table className="taa-returns-table">
            <thead>
              <tr>
                <th>Asset class</th>
                {YEARS.map(y => <th key={y}>{y}</th>)}
                <th>1Y Oct 26</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.assetClass}>
                  <td className="taa-returns-asset">{row.assetClass}</td>
                  {YEARS.map(y => retCell(row.historicalReturns[y] ?? 0, y))}
                  {retCell(row.oneYearReturn, "1y")}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── HOUSE VIEW TAB ─────────────────────────────────────── */

const VIEW_LABELS: Record<number, string> = { "-2": "Strong underweight", "-1": "Underweight", "0": "Neutral", "1": "Overweight", "2": "Strong overweight" };

function viewColor(v: number) {
  if (v >= 1) return "var(--positive)";
  if (v <= -1) return "var(--negative)";
  return "var(--text-muted)";
}

function ViewBar({ v }: { v: number }) {
  const pct = ((v + 2) / 4) * 100;
  return (
    <div className="hv-view-bar-track">
      <div className="hv-view-bar-fill" style={{ width: `${pct}%`, background: viewColor(v) }} />
      <div className="hv-view-bar-mid" />
    </div>
  );
}

function HouseViewTab({ data }: { data: AlphaBetaData | null }) {
  const { dispatch } = useApp();
  if (!data) return <div className="prepare-placeholder">Loading…</div>;

  function openRow(row: HouseViewRow) {
    dispatch({
      type: "OPEN_DRAWER",
      title: row.assetClass,
      description: `House view: ${VIEW_LABELS[row.view] ?? "Neutral"}`,
    });
  }

  return (
    <div>
      <TAAChart rows={data.taaPositioning} />
      <div className="hv-header-row" style={{ marginTop: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 650, color: "var(--brand-primary)" }}>SA house view</span>
        <SourceBadge meta={data._meta} />
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="hv-table">
          <thead>
            <tr>
              <th>Asset class</th>
              <th className="num">Expected return</th>
              <th className="num">Hurdle rate</th>
              <th className="num">Spread</th>
              <th>View</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.houseView.map(row => {
              const spread = row.expectedReturn - row.hurdleRate;
              const below = spread < 0;
              return (
                <tr key={row.assetClass} className={`hv-row${below ? " hv-row-below" : ""}`} onClick={() => openRow(row)} style={{ cursor: "pointer" }}>
                  <td className="hv-asset-name">{row.assetClass}</td>
                  <td className="num">{row.expectedReturn.toFixed(1)}%</td>
                  <td className="num hv-hurdle">{row.hurdleRate.toFixed(1)}%</td>
                  <td className={`num ${spread >= 0 ? "text-positive" : "text-negative"}`}>
                    {spread >= 0 ? "+" : ""}{spread.toFixed(1)}pp
                  </td>
                  <td>
                    <div className="hv-view-cell">
                      <ViewBar v={row.view} />
                      <span className="hv-view-label" style={{ color: viewColor(row.view) }}>
                        {VIEW_LABELS[row.view]}
                      </span>
                    </div>
                  </td>
                  <td className="hv-reason">{row.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="hv-legend">
        <span className="hv-legend-below" /> Expected return below hurdle rate — highlighted
        <span style={{ marginLeft: 16, color: "var(--text-muted)", fontSize: 11 }}>Click a row to see the full reasoning chain</span>
      </div>
    </div>
  );
}

/* ─── ASSET ALLOCATION TAB ───────────────────────────────── */

function AllocationTab({ data }: { data: PortfolioBuilderData | null }) {
  const { state } = useApp();
  if (!data) return <div className="prepare-placeholder">Loading…</div>;

  const rows = data.allocations[state.portfolio] ?? [];
  const suggestions = data.suggestions[state.portfolio] ?? [];

  return (
    <div className="alloc-layout">
      {/* Current vs target bars */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Current vs target vs allowed range — {state.portfolio}</span>
          <SourceBadge meta={data._meta} />
        </div>
        <div className="alloc-bar-list">
          {rows.map(row => {
            const rangeWidth = row.max - row.min;
            const left = row.min;
            return (
              <div key={row.assetClass} className="alloc-bar-row">
                <div className="alloc-bar-label">{row.assetClass}</div>
                <div className="alloc-bar-track">
                  {/* range band */}
                  <div className="alloc-range-band" style={{ left: `${left}%`, width: `${rangeWidth}%` }} />
                  {/* target marker */}
                  <div className="alloc-target-marker" style={{ left: `${row.target}%` }} />
                  {/* current marker */}
                  <div className="alloc-current-marker" style={{ left: `${row.current}%` }} />
                </div>
                <div className="alloc-bar-values">
                  <span className="alloc-current-val">{row.current}%</span>
                  <span className="alloc-target-val">t:{row.target}%</span>
                  <span className="alloc-range-val">{row.min}–{row.max}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="alloc-legend">
          <span className="alloc-legend-range" /> Allowed range
          <span className="alloc-legend-target" /> Target
          <span className="alloc-legend-current" /> Current
        </div>
      </div>

      {/* Efficient frontier */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Efficient frontier</span>
          <SourceBadge meta={data._meta} />
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="var(--border)" />
            <XAxis dataKey="risk" name="Risk (σ)" tickFormatter={v => `${v}%`} label={{ value: "Risk (σ)", position: "bottom", offset: -5, fontSize: 11, fill: "var(--text-muted)" }} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <YAxis dataKey="expectedReturn" name="Expected return" tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Scatter name="Frontier" data={data.frontier} fill="var(--brand-accent)" opacity={0.4} line={{ stroke: "var(--brand-accent)", strokeWidth: 1.5 }} />
            <Scatter name="Portfolios" data={data.portfolioDots} fill="var(--brand-primary)" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="frontier-labels">
          {data.portfolioDots.map(d => (
            <span key={d.name} className="frontier-dot-label">● {d.name}</span>
          ))}
        </div>
      </div>

      {/* PM vs PortfolioBuilder */}
      {suggestions.length > 0 && (
        <div className="card alloc-suggestion-card">
          <div className="card-header">
            <span className="card-title">PortfolioBuilder suggested vs PM final</span>
          </div>
          <table className="alloc-suggest-table">
            <thead>
              <tr><th>Asset class</th><th className="num">Suggested</th><th className="num">PM final</th><th>Reason</th></tr>
            </thead>
            <tbody>
              {suggestions.map(s => (
                <tr key={s.assetClass}>
                  <td>{s.assetClass}</td>
                  <td className="num">{s.suggested}%</td>
                  <td className="num" style={{ fontWeight: 650, color: "var(--brand-primary)" }}>{s.pmFinal}%</td>
                  <td className="alloc-reason">{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── MONDAY PACK TAB ────────────────────────────────────── */

const SECTIONS = [
  { id: "macro",      label: "Macro update",          status: "auto",  draft: "SA inflation fell to 3.8% and repo was cut a further 25bp to 7.75%, supporting the overweight SA bonds position. The USD/ZAR strengthened to 18.24, reducing rand-hedge pressure on global equity." },
  { id: "houseview",  label: "House view changes",     status: "auto",  draft: "No changes to asset-class views this week. SA bonds retain a +2 view on attractive real yields. Global equity stays at −1 on US valuation risk." },
  { id: "allocation", label: "Allocation proposals",   status: "needs", draft: "" },
  { id: "managers",   label: "Manager watch list",     status: "auto",  draft: "Northstar Global Equity remains on watch (Q3 B rating). No new manager events this week. Northstar review scheduled 26 Nov." },
  { id: "risks",      label: "Risks",                  status: "needs", draft: "" },
];

function MondayPackTab({ abData }: { abData: AlphaBetaData | null }) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(SECTIONS.map(s => [s.id, s.draft]))
  );
  const [exported, setExported] = useState(false);

  function regenerate(id: string) {
    const section = SECTIONS.find(s => s.id === id);
    if (section?.draft) setDrafts(d => ({ ...d, [id]: section.draft + " [regenerated]" }));
  }

  function handleExport() {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  }

  return (
    <div className="monday-layout">
      <div className="monday-header-row">
        <div>
          <div className="monday-title">Monday pack · 25 November 2026</div>
          <div className="monday-subtitle">Investment committee prep checklist</div>
        </div>
        <div className="monday-header-actions">
          <button className="btn-outline" onClick={handleExport}>{exported ? "Exported ✓" : "Export"}</button>
        </div>
      </div>

      {SECTIONS.map(section => (
        <div key={section.id} className="monday-section card">
          <div className="monday-section-header">
            <span className="monday-section-title">{section.label}</span>
            {section.status === "auto" ? (
              <span className="monday-badge monday-badge-auto">Auto-filled</span>
            ) : (
              <span className="monday-badge monday-badge-needs">Needs your input</span>
            )}
          </div>
          <textarea
            className="monday-editor"
            value={drafts[section.id]}
            placeholder={section.status === "needs" ? "Enter your commentary here…" : ""}
            onChange={e => setDrafts(d => ({ ...d, [section.id]: e.target.value }))}
          />
          {section.status === "auto" && (
            <div className="monday-ai-row">
              <span className="monday-ai-label">AI draft</span>
              <button className="btn-ghost-sm" onClick={() => regenerate(section.id)}>Regenerate draft</button>
            </div>
          )}
        </div>
      ))}

      {abData && (
        <div className="monday-source-row">
          <SourceBadge meta={abData._meta} />
        </div>
      )}
    </div>
  );
}
