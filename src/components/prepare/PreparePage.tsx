import { useEffect, useState } from "react";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import SourceBadge from "../common/source-badge/SourceBadge";
import { getBloombergData, type BloombergData, type MarketValuation, VALUATION_MARKETS } from "../../connectors/bloomberg";
import { getBCAData, type BCAData } from "../../connectors/bcaResearch";
import { getIMFData, type IMFData } from "../../connectors/imf";
import { getIressData, type IressData } from "../../connectors/iress";
import { getSimmData, type SimmData } from "../../connectors/simmInternal";
import { getAlphaBetaData, type AlphaBetaData, type TAARatingRow, type TAARow, type PortfolioWeight } from "../../connectors/alphaBeta";
import { useApp, type PackItem } from "../../context/AppContext";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import "./prepare.css";

function AddToPackBtn({ item }: { item: PackItem }) {
  const { state, dispatch } = useApp();
  const inQueue = state.packQueue.some(i => i.id === item.id);
  return (
    <button
      className={`add-to-pack-btn${inQueue ? " in-queue" : ""}`}
      title={inQueue ? "In pack — click to remove" : "Add to pack"}
      onClick={() => dispatch(inQueue
        ? { type: "REMOVE_FROM_PACK", id: item.id }
        : { type: "ADD_TO_PACK", item }
      )}
    >
      {inQueue ? "✓" : "+"}
    </button>
  );
}

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
          <AddToPackBtn item={{ id: "market-returns", title: "Market returns", section: "Market returns", sourceTab: "markets" }} />
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 650, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>SA sectors (ZAR)</div>
              <AddToPackBtn item={{ id: "sa-sectors", title: "SA sector returns", section: "Market returns", sourceTab: "markets" }} />
            </div>
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
                    <AddToPackBtn item={{ id: `theme-${t.id}`, title: t.title, section: "Themes", sourceTab: "markets" }} />
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
          <div className="card-header"><span className="card-title">IMF GDP growth forecasts (%)</span><SourceBadge meta={imf._meta} /><AddToPackBtn item={{ id: "imf-gdp", title: "IMF GDP forecasts", section: "Economy", sourceTab: "economy" }} /></div>
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
          <div className="card-header"><span className="card-title">IMF inflation forecasts (%)</span><AddToPackBtn item={{ id: "imf-inflation", title: "IMF inflation forecasts", section: "Economy", sourceTab: "economy" }} /></div>
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
        <div className="card-header"><span className="card-title">Global Manufacturing PMI</span><span className="sample-data-label">≥50 = expansion</span><AddToPackBtn item={{ id: "pmi-heatmap", title: "Global Manufacturing PMI", section: "Economy", sourceTab: "economy" }} /></div>
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
          <div className="card-header"><span className="card-title">South Africa</span><SourceBadge meta={simm._meta} /><AddToPackBtn item={{ id: "sa-macro", title: "SA macro indicators", section: "Economy", sourceTab: "economy" }} /></div>
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
          <div className="card-header"><span className="card-title">Forward P/E</span><AddToPackBtn item={{ id: `val-pe-${market}`, title: `Forward P/E — ${market}`, section: "Valuations", sourceTab: "valuations" }} /></div>
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
          <div className="card-header"><span className="card-title">EPS1/EPS0 (expected earnings growth %)</span><AddToPackBtn item={{ id: `val-eps-${market}`, title: `EPS growth — ${market}`, section: "Valuations", sourceTab: "valuations" }} /></div>
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
          <AddToPackBtn item={{ id: `val-matrix-${market}`, title: `Return matrix — ${market}`, section: "Valuations", sourceTab: "valuations" }} />
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

function TAARatingTable({ title, rows, packId }: { title: string; rows: TAARatingRow[]; packId: string }) {
  const { dispatch } = useApp();
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
        <AddToPackBtn item={{ id: packId, title, section: "TAA", sourceTab: "taa" }} />
      </div>
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

function taaViewLabel(v: number): string {
  if (v === 2)  return "+2";
  if (v === 1)  return "+1";
  if (v === 0)  return "0";
  if (v === -1) return "−1";
  return "−2";
}

function alignStatus(gap: number, view: number): "aligned" | "misaligned" | "neutral" {
  if (gap === 0 && view === 0) return "neutral";
  if (gap > 0 && view > 0) return "aligned";
  if (gap < 0 && view < 0) return "aligned";
  if (gap === 0 || view === 0) return "neutral";
  return "misaligned";
}

function PortfolioWeightsTable({ rows }: { rows: PortfolioWeight[] }) {
  const saRows     = rows.filter(r => r.assetClass.startsWith("SA"));
  const globalRows = rows.filter(r => !r.assetClass.startsWith("SA"));

  function renderSection(label: string, section: PortfolioWeight[]) {
    return (
      <>
        <tr className="pw-section-header">
          <td colSpan={5}>{label}</td>
        </tr>
        {section.map(row => {
          const gap    = +(row.actualWeight - row.benchmarkWeight).toFixed(1);
          const status = alignStatus(gap, row.taaView);
          const gapCls = gap > 0 ? "pw-gap-over" : gap < 0 ? "pw-gap-under" : "pw-gap-neutral";
          const statusCls = status === "aligned" ? "pw-status-aligned" : status === "misaligned" ? "pw-status-mis" : "pw-status-neutral";
          const viewCls = row.taaView > 0 ? "pw-view-bull" : row.taaView < 0 ? "pw-view-bear" : "pw-view-neutral";
          return (
            <tr key={row.assetClass} className="pw-row">
              <td className="pw-asset">{row.assetClass}</td>
              <td className="pw-num">{row.actualWeight.toFixed(1)}%</td>
              <td className="pw-num pw-bench">{row.benchmarkWeight.toFixed(1)}%</td>
              <td className={`pw-num pw-gap ${gapCls}`}>{gap > 0 ? "+" : ""}{gap.toFixed(1)}pp</td>
              <td className={`pw-view ${viewCls}`}>{taaViewLabel(row.taaView)}</td>
              <td className={`pw-status ${statusCls}`}>{status === "aligned" ? "✓" : status === "misaligned" ? "!" : "—"}</td>
            </tr>
          );
        })}
      </>
    );
  }

  const totalActual    = rows.reduce((s, r) => s + r.actualWeight, 0);
  const totalBenchmark = rows.reduce((s, r) => s + r.benchmarkWeight, 0);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Portfolio weights vs benchmark</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Active positions aligned to TAA views</span>
        <AddToPackBtn item={{ id: "portfolio-weights", title: "Portfolio weights vs benchmark", section: "TAA", sourceTab: "taa" }} />
        <div className="pw-legend-row">
          <span className="pw-legend-dot pw-gap-over" />OW
          <span className="pw-legend-dot pw-gap-under" style={{ marginLeft: 10 }} />UW
          <span className="pw-legend-dot pw-status-aligned" style={{ marginLeft: 10 }} />Aligned
          <span className="pw-legend-dot pw-status-mis" style={{ marginLeft: 10 }} />Misaligned
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="pw-table">
          <thead>
            <tr>
              <th>Asset class</th>
              <th className="pw-num">Actual</th>
              <th className="pw-num">Benchmark</th>
              <th className="pw-num">Active (pp)</th>
              <th className="pw-view">TAA view</th>
              <th className="pw-status">Aligned</th>
            </tr>
          </thead>
          <tbody>
            {renderSection("South Africa", saRows)}
            {renderSection("Global", globalRows)}
            <tr className="pw-total-row">
              <td>Total</td>
              <td className="pw-num">{totalActual.toFixed(1)}%</td>
              <td className="pw-num pw-bench">{totalBenchmark.toFixed(1)}%</td>
              <td className="pw-num">—</td>
              <td className="pw-view">—</td>
              <td className="pw-status">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TAATab({ ab }: { ab: AlphaBetaData | null }) {
  if (!ab) return <div className="prepare-placeholder">Loading…</div>;

  const changes = [...ab.saTAA, ...ab.globalTAA].filter(r => r.changeNote);
  const YEARS = ["2018","2019","2020","2021","2022","2023","2024","2025"];

  return (
    <div className="macro-layout">
      <div className="taa-tables-grid">
        <TAARatingTable title="SA TAA"     rows={ab.saTAA}     packId="taa-sa"     />
        <TAARatingTable title="Global TAA" rows={ab.globalTAA} packId="taa-global" />
      </div>

      <PortfolioWeightsTable rows={ab.portfolioWeights} />

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
        <div className="card-header">
          <span className="card-title">Historical returns — global asset classes (%)</span>
          <SourceBadge meta={ab._meta} />
          <AddToPackBtn item={{ id: "taa-hist-returns", title: "Historical returns", section: "TAA", sourceTab: "taa" }} />
        </div>
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

type PackStep = "build" | "preview" | "export";

function PackTab({ bloomberg: _bloomberg, bca: _bca, imf: _imf, ab: _ab }: {
  bloomberg: BloombergData | null;
  bca: BCAData | null;
  imf: IMFData | null;
  ab: AlphaBetaData | null;
}) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<PackStep>("build");
  const [narrative, setNarrative] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const queue = state.packQueue;

  async function exportToPptx() {
    setExporting(true);
    // Dynamic import so pptxgenjs doesn't bloat the initial bundle
    const PptxGenJS = (await import("pptxgenjs")).default;
    const pptx = new PptxGenJS();

    pptx.defineLayout({ name: "WIDESCREEN", width: 13.33, height: 7.5 });
    pptx.layout = "WIDESCREEN";

    // Title slide
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: "015376" };
    titleSlide.addText("PM Insight — Monthly Deck", {
      x: 0.5, y: 2.5, w: 12.33, h: 1,
      fontSize: 32, bold: true, color: "FFFFFF", align: "center",
    });
    titleSlide.addText(`November 2026 · Sanlam Multi-Manager`, {
      x: 0.5, y: 3.6, w: 12.33, h: 0.5,
      fontSize: 16, color: "00B5ED", align: "center",
    });

    // One slide per queued item
    for (const item of queue) {
      const slide = pptx.addSlide();
      // Header bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 13.33, h: 0.6,
        fill: { color: "015376" },
      });
      slide.addText(item.title, {
        x: 0.3, y: 0.1, w: 10, h: 0.4,
        fontSize: 14, bold: true, color: "FFFFFF",
      });
      slide.addText(`Section: ${item.section}`, {
        x: 0.3, y: 0.75, w: 12, h: 0.3,
        fontSize: 10, color: "5B6B77",
      });
      slide.addText(`[ ${item.title} chart / table exported from PM Insight ]`, {
        x: 0.5, y: 1.5, w: 12.33, h: 4.5,
        fontSize: 14, color: "1A2B36", align: "center", valign: "middle",
        line: { color: "DCE4EA", width: 1, dashType: "dash" },
      });
    }

    // Narrative slide (if filled)
    if (narrative.trim()) {
      const nSlide = pptx.addSlide();
      nSlide.background = { color: "F5F8FA" };
      nSlide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 13.33, h: 0.6,
        fill: { color: "015376" },
      });
      nSlide.addText("PM Narrative", {
        x: 0.3, y: 0.1, w: 10, h: 0.4,
        fontSize: 14, bold: true, color: "FFFFFF",
      });
      nSlide.addText(narrative, {
        x: 0.5, y: 0.9, w: 12.33, h: 5.5,
        fontSize: 13, color: "1A2B36", valign: "top",
      });
    }

    await pptx.writeFile({ fileName: "pm-insight-deck-nov-2026.pptx" });
    setExporting(false);
    setExported(true);
    setTimeout(() => setExported(false), 4000);
  }

  const STEP_LABELS: Array<{ id: PackStep; label: string }> = [
    { id: "build",   label: "1 · Build" },
    { id: "preview", label: "2 · Preview" },
    { id: "export",  label: "3 · Export" },
  ];

  return (
    <div className="pack-layout">
      {/* Stepper */}
      <div className="pack-stepper">
        {STEP_LABELS.map((s, i) => (
          <button
            key={s.id}
            className={`pack-step-btn${step === s.id ? " active" : ""}${i < STEP_LABELS.findIndex(x => x.id === step) ? " done" : ""}`}
            onClick={() => setStep(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── STEP 1: BUILD ── */}
      {step === "build" && (
        <div className="macro-layout">
          {queue.length === 0 ? (
            <div className="prepare-placeholder">
              No slides in queue yet.{" "}
              Hit the <strong>+</strong> button on any chart or table in Markets, Economy, Valuations or TAA tabs to add it here.
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Slide queue ({queue.length})</span>
                <button className="btn-ghost-sm" style={{ color: "var(--negative)" }} onClick={() => dispatch({ type: "CLEAR_PACK" })}>
                  Clear all
                </button>
              </div>
              <div className="pack-queue-list">
                {queue.map((item, idx) => (
                  <div key={item.id} className="pack-queue-row">
                    <span className="pack-queue-idx">{idx + 1}</span>
                    <div className="pack-queue-info">
                      <span className="pack-queue-title">{item.title}</span>
                      <span className="pack-queue-section">{item.section}</span>
                    </div>
                    <div className="pack-queue-actions">
                      <button className="pack-queue-move" disabled={idx === 0}
                        onClick={() => dispatch({ type: "REORDER_PACK", fromIndex: idx, toIndex: idx - 1 })}>↑</button>
                      <button className="pack-queue-move" disabled={idx === queue.length - 1}
                        onClick={() => dispatch({ type: "REORDER_PACK", fromIndex: idx, toIndex: idx + 1 })}>↓</button>
                      <button className="pack-queue-remove"
                        onClick={() => dispatch({ type: "REMOVE_FROM_PACK", id: item.id })}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PM Narrative */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">PM narrative (optional)</span>
              <span className="monday-ai-label">Last slide</span>
            </div>
            <textarea
              className="monday-editor"
              style={{ minHeight: 100 }}
              placeholder="Add your overall narrative or key messages for this month's deck…"
              value={narrative}
              onChange={e => setNarrative(e.target.value)}
            />
          </div>

          {queue.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-outline" onClick={() => setStep("preview")}>
                Preview deck →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: PREVIEW ── */}
      {step === "preview" && (
        <div className="macro-layout">
          <div className="pack-preview-header">
            <span className="pack-preview-count">{queue.length + 1 + (narrative.trim() ? 1 : 0)} slides total</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>(1 title + {queue.length} content{narrative.trim() ? " + 1 narrative" : ""})</span>
          </div>

          {/* Title slide preview */}
          <div className="pack-preview-slide" style={{ background: "#015376" }}>
            <div className="pack-preview-slide-inner">
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", textAlign: "center" }}>PM Insight — Monthly Deck</div>
              <div style={{ fontSize: 13, color: "#00B5ED", textAlign: "center", marginTop: 6 }}>November 2026 · Sanlam Multi-Manager</div>
            </div>
          </div>

          {queue.map((item, idx) => (
            <div key={item.id} className="pack-preview-slide">
              <div className="pack-preview-slide-bar" />
              <div className="pack-preview-slide-inner">
                <div className="pack-preview-slide-num">Slide {idx + 2}</div>
                <div className="pack-preview-slide-title">{item.title}</div>
                <div className="pack-preview-slide-section">{item.section}</div>
                <div className="pack-preview-placeholder">[ {item.title} ]</div>
              </div>
            </div>
          ))}

          {narrative.trim() && (
            <div className="pack-preview-slide" style={{ background: "var(--surface-2)" }}>
              <div className="pack-preview-slide-bar" />
              <div className="pack-preview-slide-inner">
                <div className="pack-preview-slide-num">Slide {queue.length + 2}</div>
                <div className="pack-preview-slide-title">PM Narrative</div>
                <div style={{ fontSize: 12, color: "var(--text)", marginTop: 8, lineHeight: 1.6 }}>{narrative}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-outline" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }} onClick={() => setStep("build")}>
              ← Edit
            </button>
            <button className="btn-outline" onClick={() => setStep("export")}>Export →</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: EXPORT ── */}
      {step === "export" && (
        <div className="macro-layout">
          <div className="card">
            <div className="card-header"><span className="card-title">Export deck</span></div>
            <div className="pack-export-summary">
              <div className="pack-export-row"><span>Total slides</span><strong>{queue.length + 1 + (narrative.trim() ? 1 : 0)}</strong></div>
              <div className="pack-export-row"><span>Content slides</span><strong>{queue.length}</strong></div>
              <div className="pack-export-row"><span>Narrative</span><strong>{narrative.trim() ? "Included" : "Not added"}</strong></div>
              <div className="pack-export-row"><span>Format</span><strong>.pptx (PowerPoint)</strong></div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn-outline"
                style={{ background: exporting ? "var(--surface-2)" : undefined }}
                disabled={exporting || queue.length === 0}
                onClick={exportToPptx}
              >
                {exporting ? "Building…" : exported ? "Downloaded ✓" : "Download .pptx"}
              </button>
              <button className="btn-ghost-sm" onClick={() => setStep("preview")}>← Preview</button>
            </div>
            {queue.length === 0 && (
              <div style={{ marginTop: 12, fontSize: 12, color: "var(--warning)" }}>
                No slides in queue. Go to Build step and add slides with the + buttons.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
