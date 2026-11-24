import { useEffect, useState } from "react";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import SourceBadge from "../common/source-badge/SourceBadge";
import { getBloombergData, type BloombergData, type MarketValuation, VALUATION_MARKETS } from "../../connectors/bloomberg";
import { getBCAData, type BCAData } from "../../connectors/bcaResearch";
import { getIMFData, type IMFData } from "../../connectors/imf";
import { getIressData, type IressData } from "../../connectors/iress";
import { getSimmData, type SimmData } from "../../connectors/simmInternal";
import { getAlphaBetaData, type AlphaBetaData, type TAARatingRow, type TAARow } from "../../connectors/alphaBeta";
import { useApp } from "../../context/AppContext";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import "./prepare.css";

const TABS = [
  { id: "markets",    label: "Markets & themes" },
  { id: "economy",    label: "Economy" },
  { id: "valuations", label: "Valuations" },
  { id: "taa",        label: "TAA" },
  { id: "pack",       label: "Pack" },
];

export default function PreparePage() {
  const tab = useActiveTab("prepare", "markets");
  const [bloomberg, setBloomberg] = useState<BloombergData | null>(null);
  const [bca,       setBca]       = useState<BCAData | null>(null);
  const [imf,       setImf]       = useState<IMFData | null>(null);
  const [iress,     setIress]     = useState<IressData | null>(null);
  const [simm,      setSimm]      = useState<SimmData | null>(null);
  const [ab,        setAb]        = useState<AlphaBetaData | null>(null);

  useEffect(() => { getBloombergData().then(setBloomberg); }, []);
  useEffect(() => { getBCAData().then(setBca); },       []);
  useEffect(() => { getIMFData().then(setImf); },       []);
  useEffect(() => { getIressData().then(setIress); },   []);
  useEffect(() => { getSimmData().then(setSimm); },     []);
  useEffect(() => { getAlphaBetaData().then(setAb); },  []);

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Prepare</h1>
          <p className="page-heading-sub">Monthly deck preparation — markets, economy, valuations, TAA</p>
        </div>
      </div>
      <Tabs page="prepare" tabs={TABS} />
      {tab === "markets"    && <MarketsTab    bloomberg={bloomberg} bca={bca} iress={iress} />}
      {tab === "economy"    && <EconomyTab    imf={imf} simm={simm} />}
      {tab === "valuations" && <ValuationsTab bloomberg={bloomberg} />}
      {tab === "taa"        && <TAATab        ab={ab} />}
      {tab === "pack"       && <PackTab       bloomberg={bloomberg} bca={bca} imf={imf} ab={ab} />}
    </div>
  );
}

/* ─── MARKETS & THEMES ───────────────────────────────────── */

function fmt(v: number | null): string {
  if (v === null) return "—";
  return (v > 0 ? "+" : "") + v.toFixed(1) + "%";
}
function retClass(v: number | null): string {
  if (v === null) return "";
  return v > 0 ? "text-positive" : v < 0 ? "text-negative" : "";
}

function MarketsTab({ bloomberg, bca, iress }: {
  bloomberg: BloombergData | null;
  bca: BCAData | null;
  iress: IressData | null;
}) {
  const [currency, setCurrency] = useState<"USD" | "ZAR">("USD");
  const [narratives, setNarratives] = useState<Record<string, string>>({});

  if (!bloomberg) return <div className="prepare-placeholder">Loading…</div>;

  const isZAR = currency === "ZAR";

  return (
    <div className="macro-layout">
      {/* Returns table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Market returns — {bloomberg.asOfDate}</span>
          <div className="currency-toggle">
            {(["USD","ZAR"] as const).map(c => (
              <button key={c} className={`currency-btn${currency === c ? " active" : ""}`} onClick={() => setCurrency(c)}>{c}</button>
            ))}
          </div>
          <SourceBadge meta={bloomberg._meta} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="returns-table">
            <thead>
              <tr>
                <th>Index / Asset</th>
                <th className="num">MTD</th>
                <th className="num">QTD</th>
                <th className="num">1 Month</th>
              </tr>
            </thead>
            <tbody>
              {bloomberg.returns.map(r => {
                const mtd = isZAR ? r.mtdZAR : r.mtdUSD;
                const qtd = isZAR ? r.qtdZAR : r.qtdUSD;
                const om  = isZAR ? r.oneMonthZAR : r.oneMonthUSD;
                return (
                  <tr key={r.name} className="returns-row">
                    <td className="returns-name">{r.name}</td>
                    <td className={`num ${retClass(mtd)}`}>{fmt(mtd)}</td>
                    <td className={`num ${retClass(qtd)}`}>{fmt(qtd)}</td>
                    <td className={`num ${retClass(om)}`}>{fmt(om)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {iress && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 650, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>SA sectors (ZAR)</div>
            <div style={{ overflowX: "auto" }}>
              <table className="returns-table">
                <thead><tr><th>Sector</th><th className="num">MTD</th><th className="num">QTD</th><th className="num">1M</th><th className="num">YTD</th></tr></thead>
                <tbody>
                  {iress.sectors.map(s => (
                    <tr key={s.sector} className="returns-row">
                      <td className="returns-name">{s.sector}</td>
                      <td className={`num ${retClass(s.mtd)}`}>{fmt(s.mtd)}</td>
                      <td className={`num ${retClass(s.qtd)}`}>{fmt(s.qtd)}</td>
                      <td className={`num ${retClass(s.oneMonth)}`}>{fmt(s.oneMonth)}</td>
                      <td className={`num ${retClass(s.ytd)}`}>{fmt(s.ytd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SourceBadge meta={iress._meta} />
          </div>
        )}
      </div>

      {/* Theme cards */}
      {bca && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 650, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--brand-primary)", marginBottom: 12 }}>Themes</div>
          <div className="theme-grid">
            {bca.themes.map(t => {
              const narrative = narratives[t.id] ?? t.narrative;
              return (
                <div key={t.id} className="theme-card card">
                  <div className="theme-card-header">
                    <span className="theme-card-title">{t.title}</span>
                    <div className="theme-tags">
                      {t.tags.map(tag => <span key={tag} className="connector-used-tag">{tag}</span>)}
                    </div>
                  </div>
                  <div className="theme-two-col">
                    <div className="theme-narrative-wrap">
                      <div className="monday-ai-row">
                        <span className="monday-ai-label">AI draft</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.source}</span>
                      </div>
                      <textarea
                        className="monday-editor"
                        style={{ minHeight: 80, marginTop: 6 }}
                        value={narrative}
                        onChange={e => setNarratives(n => ({ ...n, [t.id]: e.target.value }))}
                      />
                    </div>
                    <div className="theme-chart-wrap">
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>{t.chartLabel}</div>
                      <ResponsiveContainer width="100%" height={90}>
                        <LineChart data={t.chartData} margin={{ top: 2, right: 4, bottom: 2, left: 0 }}>
                          <Line type="monotone" dataKey="value" stroke="var(--brand-primary)" strokeWidth={2} dot={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                          <YAxis hide domain={["auto","auto"]} />
                          <Tooltip formatter={(v) => `${v} ${t.chartUnit}`} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ECONOMY ────────────────────────────────────────────── */

function pmiClass(v: number): string {
  if (v >= 54) return "pmi-strong";
  if (v >= 50) return "pmi-ok";
  if (v >= 46) return "pmi-weak";
  return "pmi-neg";
}

function EconomyTab({ imf, simm }: { imf: IMFData | null; simm: SimmData | null }) {
  if (!imf) return <div className="prepare-placeholder">Loading…</div>;

  return (
    <div className="macro-layout">
      {/* IMF forecasts */}
      <div className="econ-two-col">
        <div className="card">
          <div className="card-header"><span className="card-title">IMF GDP growth forecasts (%)</span><SourceBadge meta={imf._meta} /></div>
          <table className="imf-table">
            <thead><tr><th>Region</th><th className="num">2024</th><th className="num">2025</th><th className="num">2026E</th></tr></thead>
            <tbody>
              {imf.forecasts.map(f => (
                <tr key={f.region}>
                  <td className="imf-region">{f.region}</td>
                  <td className={`num ${retClass(f.growth2024)}`}>{f.growth2024.toFixed(1)}</td>
                  <td className={`num ${retClass(f.growth2025)}`}>{f.growth2025.toFixed(1)}</td>
                  <td className={`num ${retClass(f.growth2026)}`}><strong>{f.growth2026.toFixed(1)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">IMF inflation forecasts (%)</span></div>
          <table className="imf-table">
            <thead><tr><th>Region</th><th className="num">2024</th><th className="num">2025</th><th className="num">2026E</th></tr></thead>
            <tbody>
              {imf.forecasts.map(f => (
                <tr key={f.region}>
                  <td className="imf-region">{f.region}</td>
                  <td className="num">{f.inflation2024.toFixed(1)}</td>
                  <td className="num">{f.inflation2025.toFixed(1)}</td>
                  <td className="num"><strong>{f.inflation2026.toFixed(1)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PMI heatmap */}
      <div className="card">
        <div className="card-header"><span className="card-title">Global Manufacturing PMI</span><span className="sample-data-label">≥50 = expansion</span></div>
        <div style={{ overflowX: "auto" }}>
          <table className="pmi-table">
            <thead>
              <tr>
                <th>Country</th>
                {imf.pmiMonths.map(m => <th key={m}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {imf.pmiData.map(row => (
                <tr key={row.country}>
                  <td className="pmi-country">{row.country}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={`pmi-cell ${pmiClass(v)}`}>{v.toFixed(1)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SA data box */}
      {simm && (
        <div className="card">
          <div className="card-header"><span className="card-title">South Africa</span><SourceBadge meta={simm._meta} /></div>
          <div className="sa-econ-grid">
            {[
              { label: "Repo rate",          value: `${simm.saRepo}%`,             note: "Third consecutive cut" },
              { label: "CPI (Oct 2026)",      value: `${simm.saCPI}%`,              note: "Below 4.5% midpoint" },
              { label: "USD/ZAR",             value: `R${simm.usdZar}`,             note: "Month-end" },
              { label: "GDP growth",          value: `${simm.saGrowthLatest}%`,     note: "IMF 2025F" },
              { label: "Budget deficit/GDP",  value: `${simm.mtbpsDeficitGDP}%`,    note: "MTBPS Nov 2026" },
              { label: "Debt/GDP",            value: `${simm.mtbpsDebtGDP}%`,       note: "Stabilising" },
            ].map(m => (
              <div key={m.label} className="sa-econ-card">
                <div className="dh-metric-label">{m.label}</div>
                <div className="dh-metric-value" style={{ fontSize: 20 }}>{m.value}</div>
                <div className="dh-metric-note">{m.note}</div>
              </div>
            ))}
          </div>
          <div className="sa-mtbps-note">{simm.mtbpsNote}</div>
        </div>
      )}
    </div>
  );
}

/* ─── VALUATIONS ─────────────────────────────────────────── */

const EPS_ROWS = [-5, 0, 5, 10, 15, 20, 25];

function matrixCols(currentPE: number): number[] {
  const b = Math.round(currentPE / 2) * 2;
  return [b - 8, b - 6, b - 4, b - 2, b, b + 2, b + 4, b + 6].filter(v => v > 0);
}

function cellReturn(currentPE: number, exitPE: number, epsGrowth: number, divYield: number): number {
  return ((1 + epsGrowth / 100) * (exitPE / currentPE) - 1) * 100 + divYield;
}

function cellClass(r: number): string {
  if (r > 20)  return "vm-strong";
  if (r > 12)  return "vm-good";
  if (r > 6)   return "vm-ok";
  if (r > 0)   return "vm-low";
  if (r > -6)  return "vm-weak";
  return "vm-neg";
}

function takeawayText(name: string, v: MarketValuation, period: "this" | "last"): string {
  const dir = v.currentEPSGrowth > v.prevEPSGrowth ? "higher" : "lower";
  const peView = v.currentPE > v.longRunMeanPE ? "above" : "below";
  if (period === "last") {
    return `${name} EPS1/EPS0 was ${v.prevEPSGrowth.toFixed(1)}% previously. Forward P/E at ${v.currentPE}x vs long-run mean ${v.longRunMeanPE}x.`;
  }
  return `${name} EPS1/EPS0 was ${dir} at ${v.currentEPSGrowth.toFixed(1)}% from ${v.prevEPSGrowth.toFixed(1)}% previously. Consensus earnings estimates were revised ${dir}. Forward P/E at ${v.currentPE}x is ${peView} the long-run mean of ${v.longRunMeanPE}x.`;
}

function ValuationsTab({ bloomberg }: { bloomberg: BloombergData | null }) {
  const [market, setMarket] = useState<string>("MSCI World");
  const [period, setPeriod] = useState<"this" | "last">("this");
  const [selCell, setSelCell] = useState<{ row: number; col: number } | null>(null);

  if (!bloomberg) return <div className="prepare-placeholder">Loading…</div>;

  const v = bloomberg.valuations[market];
  if (!v) return <div className="prepare-placeholder">No data for {market}</div>;

  const cols   = matrixCols(v.currentPE);
  const curCol = cols.reduce((best, c, i) => Math.abs(c - v.currentPE) < Math.abs(cols[best] - v.currentPE) ? i : best, 0);
  const conRow = EPS_ROWS.reduce((best, r, i) => Math.abs(r - v.consensusEPSGrowth) < Math.abs(EPS_ROWS[best] - v.consensusEPSGrowth) ? i : best, 0);

  return (
    <div className="macro-layout">
      {/* Market picker + toggle */}
      <div className="val-controls">
        <div>
          <label className="macro-form-label" style={{ marginBottom: 4, display: "block" }}>Market</label>
          <select className="market-picker" value={market} onChange={e => { setMarket(e.target.value); setSelCell(null); }}>
            {VALUATION_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="currency-toggle" style={{ alignSelf: "flex-end" }}>
          {(["this","last"] as const).map(p => (
            <button key={p} className={`currency-btn${period === p ? " active" : ""}`} onClick={() => setPeriod(p)}>
              {p === "this" ? "This month" : "Last month"}
            </button>
          ))}
        </div>
        <SourceBadge meta={bloomberg._meta} />
      </div>

      {/* Charts */}
      <div className="val-charts-row">
        <div className="card">
          <div className="card-header"><span className="card-title">Forward P/E</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={v.peSeries} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis domain={["auto","auto"]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <Tooltip formatter={(val) => `${val}x`} />
              <ReferenceLine y={v.longRunMeanPE} stroke="var(--warning)" strokeDasharray="4 2"
                label={{ value: `Mean ${v.longRunMeanPE}x`, position: "right", fontSize: 10, fill: "var(--warning)" }} />
              <Line type="monotone" dataKey="pe" name="Fwd P/E" stroke="var(--brand-primary)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">EPS1/EPS0 (expected earnings growth %)</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={v.epsSeries} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis domain={["auto","auto"]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={val => `${val}%`} />
              <Tooltip formatter={(val) => `${val}%`} />
              <ReferenceLine y={0} stroke="var(--border-mid)" />
              <Line type="monotone" dataKey="growth" name="EPS growth" stroke="var(--brand-accent)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Takeaway banner */}
      <div className="takeaway-banner">
        <span className="takeaway-label">Takeaway</span>
        <span className="takeaway-text">{takeawayText(market, v, period)}</span>
      </div>

      {/* Valuation matrix */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Total return matrix — {market}</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Rows = EPS growth · Cols = exit P/E · current P/E {v.currentPE}x · div yield {v.dividendYield}%</span>
        </div>
        {selCell !== null && (
          <div className="vm-selected-info">
            EPS growth {EPS_ROWS[selCell.row]}% × exit P/E {cols[selCell.col]}x →{" "}
            <strong>{cellReturn(v.currentPE, cols[selCell.col], EPS_ROWS[selCell.row], v.dividendYield).toFixed(1)}% expected total return</strong>
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table className="vm-table">
            <thead>
              <tr>
                <th>EPS growth</th>
                {cols.map((c, ci) => (
                  <th key={c} className={ci === curCol ? "vm-col-current" : ""}>{c}x</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EPS_ROWS.map((row, ri) => (
                <tr key={row} className={ri === conRow ? "vm-row-consensus" : ""}>
                  <td className="vm-row-label">{row > 0 ? "+" : ""}{row}%{ri === conRow ? " ★" : ""}</td>
                  {cols.map((col, ci) => {
                    const ret = cellReturn(v.currentPE, col, row, v.dividendYield);
                    const isSel = selCell?.row === ri && selCell?.col === ci;
                    return (
                      <td
                        key={col}
                        className={`vm-cell ${cellClass(ret)} ${ci === curCol ? "vm-col-current" : ""} ${isSel ? "vm-cell-sel" : ""}`}
                        onClick={() => setSelCell(isSel ? null : { row: ri, col: ci })}
                        title={`${ret.toFixed(1)}% total return`}
                      >
                        {ret.toFixed(0)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="vm-legend">
          <span className="vm-legend-swatch vm-strong" /> &gt;20%
          <span className="vm-legend-swatch vm-good" /> 12–20%
          <span className="vm-legend-swatch vm-ok" /> 6–12%
          <span className="vm-legend-swatch vm-low" /> 0–6%
          <span className="vm-legend-swatch vm-weak" /> –6–0%
          <span className="vm-legend-swatch vm-neg" /> &lt;–6%
          &nbsp;&nbsp;★ Consensus EPS row &nbsp;&nbsp; ◫ Current P/E col
        </div>
      </div>
    </div>
  );
}

/* ─── TAA ────────────────────────────────────────────────── */

const COL_VALS = [-2, -1, 0, 1, 2] as const;
const COL_LABEL: Record<number, string> = { "-2": "-2", "-1": "-1", "0": "0", "1": "+1", "2": "+2" };

function TAARatingTable({ title, rows }: { title: string; rows: TAARatingRow[] }) {
  const { dispatch } = useApp();
  return (
    <div className="card">
      <div className="card-header"><span className="card-title">{title}</span></div>
      <table className="taa-rating-table">
        <thead>
          <tr>
            <th>Asset class</th>
            {COL_VALS.map(c => <th key={c} className="taa-rating-th">{COL_LABEL[c]}</th>)}
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.assetClass} className="taa-rating-row" style={{ cursor: "pointer" }}
              onClick={() => dispatch({ type: "OPEN_DRAWER", title: row.assetClass, description: `TAA view: ${COL_LABEL[row.current]}` })}>
              <td className="taa-rating-asset">{row.assetClass}</td>
              {COL_VALS.map(col => {
                const isCur   = row.current   === col;
                const isShort = row.shortTerm === col;
                const isLong  = row.longTerm  === col;
                return (
                  <td key={col} className={[
                    "taa-rating-cell",
                    isCur              ? "taa-cell-current" : "",
                    isShort && !isCur  ? "taa-cell-short"   : "",
                  ].filter(Boolean).join(" ")}>
                    {isLong && !isCur && !isShort ? "△" : ""}
                    {isLong && isCur              ? "△" : ""}
                  </td>
                );
              })}
              <td className="taa-rating-change">{row.changeNote ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="taa-rating-legend">
        <span className="taa-legend-filled" /> Current
        <span className="taa-legend-outline" /> 0–6m view
        △ 6–12m view &nbsp;·&nbsp; Scale: 0 = neutral · ±1 = 1–2% · ±2 = 2–4%
      </div>
    </div>
  );
}

function retCell(v: number, key: string) {
  const cls = v >= 8 ? "ret-strong" : v > 0 ? "ret-pos" : "ret-neg";
  return <td key={key} className={`taa-returns-cell ${cls}`}>{v > 0 ? "+" : ""}{v.toFixed(1)}</td>;
}

function TAATab({ ab }: { ab: AlphaBetaData | null }) {
  if (!ab) return <div className="prepare-placeholder">Loading…</div>;

  const changes = [...ab.saTAA, ...ab.globalTAA].filter(r => r.changeNote);
  const YEARS = ["2018","2019","2020","2021","2022","2023","2024","2025"];

  return (
    <div className="macro-layout">
      <div className="taa-tables-grid">
        <TAARatingTable title="SA TAA"     rows={ab.saTAA}     />
        <TAARatingTable title="Global TAA" rows={ab.globalTAA} />
      </div>

      {/* What changed */}
      {changes.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">What changed since last month</span></div>
          <div className="macro-changes-list">
            {changes.map(r => (
              <div key={r.assetClass} className="macro-change-row">
                <span className="macro-change-icon" style={{ color: r.changeNote?.startsWith("↑") ? "var(--positive)" : r.changeNote?.startsWith("↓") ? "var(--negative)" : "var(--text-muted)" }}>
                  {r.changeNote?.charAt(0)}
                </span>
                <span><strong>{r.assetClass}</strong>: {r.changeNote?.slice(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10-year returns */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header"><span className="card-title">Historical returns — global asset classes (%)</span><SourceBadge meta={ab._meta} /></div>
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
              {(ab.taaPositioning as TAARow[]).map((row: TAARow) => (
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

/* ─── PACK ───────────────────────────────────────────────── */

function PackTab({ bloomberg, bca, imf, ab }: {
  bloomberg: BloombergData | null;
  bca: BCAData | null;
  imf: IMFData | null;
  ab: AlphaBetaData | null;
}) {
  const [exported, setExported] = useState(false);
  const themeCount  = bca?.themes.length ?? 0;
  const marketCount = bloomberg?.returns.length ?? 0;
  const valCount    = 10;

  const autoCount = 3 + themeCount + 3 + valCount + 3;
  const needsCount = 3;
  const total = autoCount + needsCount;

  const SECTIONS = [
    {
      title: "Market returns", slides: [
        { label: "Global index returns",        auto: true },
        { label: "SA sector returns",           auto: true },
        { label: `Currency & commodities (${marketCount} series)`, auto: true },
        { label: "Selected stock commentary",   auto: false },
      ]
    },
    {
      title: "Themes", slides: (bca?.themes ?? []).map(t => ({ label: t.title, auto: true }))
    },
    {
      title: "Economic data", slides: [
        { label: "IMF growth forecasts",        auto: true },
        { label: "Global PMI heatmap",          auto: imf !== null },
        { label: "SA MTBPS update",             auto: true },
      ]
    },
    {
      title: `Valuations (${valCount} markets)`, slides: [
        { label: "MSCI World — P/E + EPS + matrix", auto: true },
        { label: "S&P 500 — P/E + EPS + matrix",    auto: true },
        { label: "MSCI EM — P/E + EPS + matrix",    auto: true },
        { label: "JSE ALSI — P/E + EPS + matrix",   auto: true },
        { label: "+ 6 further markets",             auto: true },
        { label: "Opening valuation narrative",     auto: false },
      ]
    },
    {
      title: "TAA", slides: [
        { label: `SA TAA (${ab?.saTAA.length ?? 0} asset classes)`,     auto: true },
        { label: `Global TAA (${ab?.globalTAA.length ?? 0} asset classes)`, auto: true },
        { label: "What changed since last month",   auto: true },
        { label: "CIO sign-off commentary",         auto: false },
      ]
    },
  ];

  return (
    <div className="monday-layout">
      <div className="monday-header-row">
        <div>
          <div className="monday-title">Monthly deck · November 2026</div>
          <div className="monday-subtitle">
            Slides auto-filled: <strong>{autoCount}</strong> of <strong>{total}</strong> · {needsCount} need your input
          </div>
        </div>
        <div className="monday-header-actions">
          <button className="btn-outline" onClick={() => { setExported(true); setTimeout(() => setExported(false), 3000); }}>
            {exported ? "Export queued ✓" : "Export to PowerPoint"}
          </button>
        </div>
      </div>

      {SECTIONS.map(sec => (
        <div key={sec.title} className="card monday-section">
          <div className="monday-section-header">
            <span className="monday-section-title">{sec.title}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{sec.slides.filter(s => s.auto).length} / {sec.slides.length} auto</span>
          </div>
          <div className="pack-slide-list">
            {sec.slides.map((slide, i) => (
              <div key={i} className={`pack-slide${slide.auto ? "" : " pack-slide-needs"}`}>
                <span className="pack-slide-label">{slide.label}</span>
                <span className={`monday-badge ${slide.auto ? "monday-badge-auto" : "monday-badge-needs"}`}>
                  {slide.auto ? "Auto-filled" : "Needs input"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
