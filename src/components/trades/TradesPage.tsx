import { useState, useRef, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  type ImportedTrade, type Platform, type TradeStatus,
  type TradeHolding, PLATFORM_SHORTS, EXCEL_TEMPLATE_HEADERS, EXCEL_TEMPLATE_EXAMPLE,
} from "../../connectors/trades";
import { getClientsData, type Client } from "../../connectors/clients";
import { useApp } from "../../context/AppContext";
import "./trades.css";

/* ─── helpers ─────────────────────────────────────────── */

function fmt(v: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(v);
}
function platformClass(p: Platform) {
  return p === "NinetyOne" ? "NinetyOne" : p === "Old Mutual" ? "OldMutual"
    : p === "Glacier" ? "Glacier" : "SanlamWealth";
}
function instrClass(i: string) {
  return i === "Buy" ? "buy" : i === "Sell" ? "sell" : i === "Switch" ? "switch" : "mixed";
}
function instrColor(i: string) {
  return i === "Buy" ? "var(--positive)" : i === "Sell" ? "var(--negative)"
    : i === "Switch" ? "var(--warning)" : "#5B3FA0";
}

const PLATFORMS: Platform[] = ["NinetyOne", "Old Mutual", "Glacier", "Sanlam Wealth"];
const STATUSES: TradeStatus[] = ["Pending", "Active", "Settled", "Cancelled"];

/* ─── badge components ────────────────────────────────── */

function PlatformBadge({ platform }: { platform: Platform }) {
  return <span className={`platform-badge ${platformClass(platform)}`}>{platform}</span>;
}
function StatusBadge({ status }: { status: TradeStatus }) {
  return <span className={`trade-status ${status.toLowerCase()}`}>{status}</span>;
}
function InstrBadge({ instruction }: { instruction: string }) {
  return <span className={`instr-badge ${instrClass(instruction)}`}>{instruction}</span>;
}

/* ─── main page ───────────────────────────────────────── */

type RightView = "detail" | "import";

export default function TradesPage() {
  const { state, dispatch } = useApp();
  const { trades, selectedTradeId, tradeNotes } = state;

  const [rightView, setRightView]       = useState<RightView>("detail");
  const [platformFilter, setPlatform]   = useState("All");
  const [statusFilter,   setStatus]     = useState("All");
  const [search,         setSearch]     = useState("");

  const selectedTrade = trades.find(t => t.id === selectedTradeId) ?? null;

  const filtered = trades.filter(t => {
    const pOk = platformFilter === "All" || t.platform === platformFilter;
    const sOk = statusFilter   === "All" || t.status   === statusFilter;
    const q   = search.toLowerCase();
    return pOk && sOk && (!q || t.clientName.toLowerCase().includes(q)
      || t.reference.toLowerCase().includes(q) || t.platform.toLowerCase().includes(q));
  });

  function exportToExcel() {
    // Sheet 1: summary
    const summaryRows = [
      ["Reference","Platform","Client","Trade Date","Settlement","Status","Instruction","Total (ZAR)","Holdings"],
      ...filtered.map(t => [
        t.reference, t.platform, t.clientName, t.tradeDate, t.settlementDate,
        t.status, t.instruction, t.totalValueZAR, t.holdings.length,
      ]),
    ];
    // Sheet 2: holdings
    const holdingRows = [
      ["Trade Ref","Client","Fund Name","ISIN","Asset Class","Instruction","Alloc %","Value ZAR","Units","Price"],
      ...filtered.flatMap(t => t.holdings.map(h => [
        t.reference, t.clientName, h.fundName, h.isin, h.assetClass,
        h.instruction, h.allocationPct, h.valueZAR, h.units ?? "", h.pricePerUnit ?? "",
      ])),
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows),  "Trade Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(holdingRows), "Holdings");
    XLSX.writeFile(wb, `trades-export-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Trades</h1>
          <p className="page-heading-sub">Import and view trade instructions across platforms</p>
        </div>
      </div>

      <div className="trades-layout">
        {/* ── Left sidebar ── */}
        <div className="trades-sidebar">
          <button className="trades-import-btn" onClick={() => setRightView("import")}>
            <span className="import-plus">+</span>
            Import trade sheet
          </button>

          <div className="trades-search">
            <span>🔍</span>
            <input placeholder="Search client, reference…" value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>

          <div>
            <div className="trades-filter-label">PLATFORM</div>
            <div className="trades-filter-row">
              {["All", ...PLATFORMS].map(p => (
                <button key={p} className={`pill${platformFilter === p ? " active" : ""}`}
                  onClick={() => setPlatform(p)}>{p}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="trades-filter-label">STATUS</div>
            <div className="trades-filter-row">
              {["All", ...STATUSES].map(s => (
                <button key={s} className={`pill${statusFilter === s ? " active" : ""}`}
                  onClick={() => setStatus(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="trade-list">
            {filtered.length === 0 && (
              <div style={{ padding: "16px 0", color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
                No trades match filters.
              </div>
            )}
            {filtered.map(t => (
              <div key={t.id}
                className={`trade-card${selectedTradeId === t.id && rightView === "detail" ? " selected" : ""}`}
                onClick={() => { dispatch({ type: "SET_SELECTED_TRADE", id: t.id }); setRightView("detail"); }}
              >
                <div className="trade-card-header">
                  <div>
                    <div className="trade-card-client">{t.clientName}</div>
                    <div className="trade-card-ref">{t.reference}</div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="trade-card-meta">
                  <PlatformBadge platform={t.platform} />
                  <InstrBadge instruction={t.instruction} />
                  <span className="trade-card-date">{t.tradeDate}</span>
                </div>
                <div className="trade-card-value">{fmt(t.totalValueZAR)}</div>
              </div>
            ))}
          </div>

          {filtered.length > 0 && (
            <button className="btn-outline" onClick={exportToExcel}
              style={{ fontSize: 12, padding: "7px 14px", marginTop: 4 }}>
              ↓ Export {filtered.length} trade{filtered.length !== 1 ? "s" : ""} to Excel
            </button>
          )}
        </div>

        {/* ── Right panel ── */}
        <div>
          {rightView === "import" && (
            <ImportPanel
              onSave={t => { dispatch({ type: "ADD_TRADE", trade: t }); setRightView("detail"); }}
              onCancel={() => setRightView("detail")}
            />
          )}
          {rightView === "detail" && selectedTrade && (
            <TradeDetail
              trade={selectedTrade}
              allTrades={trades}
              note={tradeNotes[selectedTrade.id] ?? selectedTrade.notes}
              onNoteChange={v => dispatch({ type: "SET_TRADE_NOTE", tradeId: selectedTrade.id, note: v })}
            />
          )}
          {rightView === "detail" && !selectedTrade && (
            <div className="card trades-empty">
              <div className="trades-empty-icon">📋</div>
              <div className="trades-empty-title">No trade selected</div>
              <div className="trades-empty-sub">Select a trade from the list, or import a new sheet.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Trade detail ────────────────────────────────────── */

type DetailTab = "overview" | "holdings" | "compare" | "notes";

function TradeDetail({
  trade, allTrades, note, onNoteChange,
}: { trade: ImportedTrade; allTrades: ImportedTrade[]; note: string; onNoteChange: (v: string) => void }) {
  const [tab, setTab] = useState<DetailTab>("overview");

  return (
    <div className="trade-detail">
      <div className="trade-detail-header">
        <div>
          <div className="trade-detail-title">{trade.clientName}</div>
          <div className="trade-detail-ref">{trade.reference}</div>
        </div>
        <div className="trade-detail-badges">
          <PlatformBadge platform={trade.platform} />
          <InstrBadge instruction={trade.instruction} />
          <StatusBadge status={trade.status} />
        </div>
      </div>

      <div className="trade-kpi-strip">
        {[
          { label: "Total value",      value: fmt(trade.totalValueZAR), sub: trade.currency },
          { label: "Holdings",         value: String(trade.holdings.length), sub: "instruments" },
          { label: "Settlement date",  value: trade.settlementDate, sub: `Trade: ${trade.tradeDate}` },
          { label: "Status",           value: trade.status, sub: `Imported ${trade.importDate}` },
        ].map(k => (
          <div key={k.label} className="trade-kpi-tile">
            <div className="trade-kpi-label">{k.label}</div>
            <div className="trade-kpi-value">{k.value}</div>
            <div className="trade-kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="profile-inner-tabs">
        {(["overview","holdings","compare","notes"] as DetailTab[]).map(t => (
          <button key={t} className={`profile-inner-tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview"  && <OverviewTab  trade={trade} />}
      {tab === "holdings"  && <HoldingsTab  trade={trade} />}
      {tab === "compare"   && <CompareTab   trade={trade} allTrades={allTrades} />}
      {tab === "notes"     && <NotesTab     note={note}   onChange={onNoteChange} />}
    </div>
  );
}

/* ── Overview tab ── */
function OverviewTab({ trade }: { trade: ImportedTrade }) {
  const totalAlloc = trade.holdings.reduce((s, h) => s + h.allocationPct, 0);
  return (
    <div className="trade-overview-grid">
      <div className="card">
        <div className="card-header"><span className="card-title">Trade details</span></div>
        {[
          ["Platform",        trade.platform],
          ["Client",          trade.clientName],
          ["Reference",       trade.reference],
          ["Trade date",      trade.tradeDate],
          ["Settlement date", trade.settlementDate],
          ["Total value",     fmt(trade.totalValueZAR)],
          ["Instruction",     trade.instruction],
          ["Source",          trade._importedFrom === "excel" ? "Imported from Excel" : "Demo data"],
        ].map(([k, v]) => (
          <div key={k} className="trade-meta-row">
            <span className="trade-meta-key">{k}</span>
            <span className="trade-meta-value">{v}</span>
          </div>
        ))}
        {trade.notes && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--text)" }}>Notes: </strong>{trade.notes}
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Allocation breakdown</span>
          {totalAlloc !== 100 && (
            <span style={{ fontSize: 11, color: "var(--warning)" }}>Total: {totalAlloc.toFixed(1)}%</span>
          )}
        </div>
        <div className="alloc-bar-list">
          {trade.holdings.map(h => (
            <div key={h.isin} className="alloc-bar-row">
              <span className="alloc-bar-name" title={h.fundName}>{h.fundName}</span>
              <div className="alloc-bar-track">
                <div className="alloc-bar-fill"
                  style={{ width: `${h.allocationPct}%`, background: instrColor(h.instruction) }} />
              </div>
              <span className="alloc-bar-pct">{h.allocationPct}%</span>
              <span className="alloc-bar-val">{fmt(h.valueZAR)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Holdings tab ── */
function HoldingsTab({ trade }: { trade: ImportedTrade }) {
  const totalAlloc = trade.holdings.reduce((s, h) => s + h.allocationPct, 0);
  const totalValue = trade.holdings.reduce((s, h) => s + h.valueZAR, 0);
  return (
    <div className="card">
      <div className="card-header"><span className="card-title">Holdings</span></div>
      <div className="holdings-wrap">
        <table className="holdings-table">
          <thead>
            <tr>
              <th>Fund name</th><th>ISIN</th><th>Asset class</th><th>Instruction</th>
              <th style={{ textAlign:"right" }}>Alloc %</th>
              <th style={{ textAlign:"right" }}>Value (ZAR)</th>
              <th style={{ textAlign:"right" }}>Units</th>
              <th style={{ textAlign:"right" }}>Price</th>
              <th>Switch from</th>
            </tr>
          </thead>
          <tbody>
            {trade.holdings.map(h => (
              <tr key={h.isin}>
                <td>{h.fundName}</td>
                <td><span className="holdings-isin">{h.isin}</span></td>
                <td>{h.assetClass}</td>
                <td><InstrBadge instruction={h.instruction} /></td>
                <td className="holdings-pct" style={{ textAlign:"right" }}>{h.allocationPct.toFixed(2)}%</td>
                <td className="holdings-val" style={{ textAlign:"right" }}>{fmt(h.valueZAR)}</td>
                <td style={{ textAlign:"right", color:"var(--text-muted)" }}>
                  {h.units ? h.units.toLocaleString("en-ZA") : "—"}
                </td>
                <td style={{ textAlign:"right", color:"var(--text-muted)" }}>
                  {h.pricePerUnit ? `R ${h.pricePerUnit.toFixed(2)}` : "—"}
                </td>
                <td>
                  {h.switchFromFund
                    ? <span className="holdings-switch-from">{h.switchFromFund}</span>
                    : <span style={{ color:"var(--text-muted)" }}>—</span>}
                </td>
              </tr>
            ))}
            <tr className="holdings-total-row">
              <td colSpan={4}><strong>Total</strong></td>
              <td style={{ textAlign:"right" }}><strong>{totalAlloc.toFixed(2)}%</strong></td>
              <td style={{ textAlign:"right" }}><strong>{fmt(totalValue)}</strong></td>
              <td colSpan={3} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Compare tab ── */
interface CompareRow {
  fundName: string; isin: string; assetClass: string;
  allocA?: number; allocB?: number;
  valueA?: number; valueB?: number;
  status: "added" | "removed" | "changed" | "unchanged";
}

function buildCompare(a: ImportedTrade, b: ImportedTrade): CompareRow[] {
  const mapA = new Map(a.holdings.map(h => [h.isin, h]));
  const mapB = new Map(b.holdings.map(h => [h.isin, h]));
  const rows: CompareRow[] = [];

  mapA.forEach((ha, isin) => {
    const hb = mapB.get(isin);
    rows.push({
      fundName: ha.fundName, isin, assetClass: ha.assetClass,
      allocA: ha.allocationPct, allocB: hb?.allocationPct,
      valueA: ha.valueZAR,     valueB: hb?.valueZAR,
      status: !hb ? "removed"
        : Math.abs(ha.allocationPct - hb.allocationPct) > 0.01 ? "changed"
        : "unchanged",
    });
  });
  mapB.forEach((hb, isin) => {
    if (!mapA.has(isin)) {
      rows.push({
        fundName: hb.fundName, isin, assetClass: hb.assetClass,
        allocB: hb.allocationPct, valueB: hb.valueZAR,
        status: "added",
      });
    }
  });
  return rows.sort((a, b) => (b.allocA ?? 0) - (a.allocA ?? 0));
}

function compareBg(s: CompareRow["status"]) {
  return s === "added" ? "#E6F5ED" : s === "removed" ? "#FDEAEA"
    : s === "changed" ? "#FEF3E2" : "transparent";
}

function CompareTab({ trade, allTrades }: { trade: ImportedTrade; allTrades: ImportedTrade[] }) {
  const others = allTrades.filter(t => t.id !== trade.id);
  const [compareId, setCompareId] = useState(others[0]?.id ?? "");
  const compareTrade = allTrades.find(t => t.id === compareId);

  const rows = compareTrade ? buildCompare(trade, compareTrade) : [];
  const added    = rows.filter(r => r.status === "added").length;
  const removed  = rows.filter(r => r.status === "removed").length;
  const changed  = rows.filter(r => r.status === "changed").length;

  return (
    <div className="card compare-panel">
      <div className="card-header">
        <span className="card-title">Compare against</span>
        <select className="compare-select" value={compareId}
          onChange={e => setCompareId(e.target.value)}>
          <option value="">— select trade —</option>
          {others.map(t => (
            <option key={t.id} value={t.id}>{t.reference} · {t.clientName}</option>
          ))}
        </select>
      </div>

      {compareTrade && (
        <>
          <div className="compare-legend">
            <span className="compare-chip added">+{added} new</span>
            <span className="compare-chip removed">−{removed} removed</span>
            <span className="compare-chip changed">~{changed} changed</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
              A: {trade.reference} &nbsp;→&nbsp; B: {compareTrade.reference}
            </span>
          </div>
          <div className="holdings-wrap">
            <table className="holdings-table compare-table">
              <thead>
                <tr>
                  <th>Fund</th><th>ISIN</th>
                  <th style={{ textAlign:"right" }}>Alloc A</th>
                  <th style={{ textAlign:"right" }}>Alloc B</th>
                  <th style={{ textAlign:"right" }}>Δ Alloc</th>
                  <th style={{ textAlign:"right" }}>Value A</th>
                  <th style={{ textAlign:"right" }}>Value B</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const delta = (r.allocB ?? 0) - (r.allocA ?? 0);
                  return (
                    <tr key={r.isin} style={{ background: compareBg(r.status) }}>
                      <td>{r.fundName}</td>
                      <td><span className="holdings-isin">{r.isin}</span></td>
                      <td style={{ textAlign:"right" }}>{r.allocA != null ? `${r.allocA.toFixed(2)}%` : "—"}</td>
                      <td style={{ textAlign:"right" }}>{r.allocB != null ? `${r.allocB.toFixed(2)}%` : "—"}</td>
                      <td style={{ textAlign:"right",
                        color: delta > 0 ? "var(--positive)" : delta < 0 ? "var(--negative)" : "var(--text-muted)",
                        fontWeight: delta !== 0 ? 650 : 400 }}>
                        {delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}pp`}
                      </td>
                      <td style={{ textAlign:"right", color:"var(--text-muted)" }}>
                        {r.valueA != null ? fmt(r.valueA) : "—"}
                      </td>
                      <td style={{ textAlign:"right", color:"var(--text-muted)" }}>
                        {r.valueB != null ? fmt(r.valueB) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!compareTrade && others.length > 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "12px 0" }}>
          Select a trade above to compare side-by-side.
        </p>
      )}
      {others.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "12px 0" }}>
          Import at least one more trade to use the compare view.
        </p>
      )}
    </div>
  );
}

/* ── Notes tab ── */
function NotesTab({ note, onChange }: { note: string; onChange: (v: string) => void }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Trade notes</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Auto-saved · private</span>
      </div>
      <textarea className="trade-notes-area" value={note} onChange={e => onChange(e.target.value)}
        placeholder="Add notes about this trade — rationale, client instructions, follow-ups…" />
    </div>
  );
}

/* ─── Column mapper ───────────────────────────────────── */

type FieldKey =
  | "fundName" | "isin" | "assetClass" | "instruction"
  | "allocationPct" | "valueZAR" | "units" | "pricePerUnit" | "switchFrom";

type ColumnMap = Record<FieldKey, number>;  // -1 = unmapped/skip

const FIELD_LABELS: Record<FieldKey, string> = {
  fundName:     "Fund Name",
  isin:         "ISIN",
  assetClass:   "Asset Class",
  instruction:  "Instruction (Buy / Sell / Switch)",
  allocationPct:"Allocation %",
  valueZAR:     "Value (ZAR)",
  units:        "Units",
  pricePerUnit: "Price Per Unit",
  switchFrom:   "Switch From Fund",
};

const REQUIRED_FIELDS: FieldKey[] = ["fundName", "isin", "assetClass", "instruction", "allocationPct", "valueZAR"];
const OPTIONAL_FIELDS: FieldKey[] = ["units", "pricePerUnit", "switchFrom"];

const AUTO_PATTERNS: Record<FieldKey, RegExp> = {
  fundName:     /fund.?name|^name$|^fund$/i,
  isin:         /^isin$/i,
  assetClass:   /asset.?class|class|category/i,
  instruction:  /instruction|^type$|^action$/i,
  allocationPct:/alloc|percent|%/i,
  valueZAR:     /value|amount|zar|rand/i,
  units:        /^units$|quantity|qty/i,
  pricePerUnit: /price|nav|unit.?price/i,
  switchFrom:   /switch.?from|from.?fund/i,
};

function autoDetect(headers: string[]): ColumnMap {
  const result = {} as ColumnMap;
  for (const field of ([...REQUIRED_FIELDS, ...OPTIONAL_FIELDS] as FieldKey[])) {
    const idx = headers.findIndex(h => AUTO_PATTERNS[field].test(h.trim()));
    result[field] = idx;
  }
  return result;
}

function applyMap(raw: (string | number | undefined)[][], map: ColumnMap): ParsedRow[] {
  const cell = (row: (string | number | undefined)[], i: number) =>
    i < 0 ? "" : String(row[i] ?? "").trim();

  return raw.slice(1).filter(row => row.some(c => c !== undefined && c !== "")).map(row => {
    const fundName    = cell(row, map.fundName);
    const isin        = cell(row, map.isin);
    const assetClass  = cell(row, map.assetClass);
    const instruction = cell(row, map.instruction);
    const allocRaw    = cell(row, map.allocationPct).replace("%","");
    const valRaw      = cell(row, map.valueZAR).replace(/[^0-9.]/g,"");
    const units       = cell(row, map.units);
    const price       = cell(row, map.pricePerUnit);
    const switchFrom  = cell(row, map.switchFrom);

    let _error: string | undefined;
    if (!fundName) _error = "Missing fund name";
    else if (!isin) _error = "Missing ISIN";
    else if (!["Buy","Sell","Switch"].includes(instruction)) _error = `Unknown instruction "${instruction}"`;
    else if (isNaN(Number(allocRaw))) _error = "Invalid allocation %";
    else if (isNaN(Number(valRaw))) _error = "Invalid value ZAR";

    return {
      fundName, isin, assetClass, instruction,
      allocationPct: Number(allocRaw),
      valueZAR:      Number(valRaw),
      units, pricePerUnit: price, switchFrom,
      _error,
    };
  });
}

/* ─── Import panel ────────────────────────────────────── */

type ImportStep = "form" | "mapper" | "preview";

interface ParsedRow {
  fundName: string; isin: string; assetClass: string; instruction: string;
  allocationPct: number; valueZAR: number;
  units: string; pricePerUnit: string; switchFrom: string;
  _error?: string;
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([EXCEL_TEMPLATE_HEADERS, EXCEL_TEMPLATE_EXAMPLE]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Trade");
  XLSX.writeFile(wb, "trade-template.xlsx");
}

function ImportPanel({ onSave, onCancel }: { onSave: (t: ImportedTrade) => void; onCancel: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => { getClientsData().then(d => setClients(d.clients)); }, []);

  const today = new Date().toISOString().slice(0, 10);
  const plus3  = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);

  const [step,           setStep]           = useState<ImportStep>("form");
  const [platform,       setPlatform]       = useState<Platform>("NinetyOne");
  const [clientId,       setClientId]       = useState("");
  const [reference,      setReference]      = useState(
    `${PLATFORM_SHORTS["NinetyOne"]}-${today.replace(/-/g,"")}-${Math.floor(Math.random()*900+100)}`
  );
  const [tradeDate,      setTradeDate]      = useState(today);
  const [settlementDate, setSettlementDate] = useState(plus3);
  const [notes,          setNotes]          = useState("");

  const [fileName,   setFileName]   = useState("");
  const [rawData,    setRawData]    = useState<(string | number | undefined)[][]>([]);
  const [headers,    setHeaders]    = useState<string[]>([]);
  const [colMap,     setColMap]     = useState<ColumnMap>({} as ColumnMap);
  const [rows,       setRows]       = useState<ParsedRow[]>([]);
  const [isDragOver, setDragOver]   = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  function updatePlatform(p: Platform) {
    setPlatform(p);
    setReference(`${PLATFORM_SHORTS[p]}-${tradeDate.replace(/-/g,"")}-${Math.floor(Math.random()*900+100)}`);
  }

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb   = XLSX.read(data, { type: "array" });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json<(string|number|undefined)[]>(ws, { header: 1 }) as (string|number|undefined)[][];
      const hdrs = (raw[0] ?? []).map(h => String(h ?? ""));
      const detected = autoDetect(hdrs);
      setRawData(raw);
      setHeaders(hdrs);
      setColMap(detected);
      setStep("mapper");
    };
    reader.readAsArrayBuffer(file);
  }, []);

  function confirmMapping() {
    setRows(applyMap(rawData, colMap));
    setStep("preview");
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const errorCount  = rows.filter(r => r._error).length;
  const totalAlloc  = rows.reduce((s, r) => s + (r._error ? 0 : r.allocationPct), 0);
  const canSave     = clientId && rows.length > 0 && errorCount === 0;

  function handleSave() {
    if (!canSave) return;
    const client = clients.find(c => c.id === clientId);
    const holdings: TradeHolding[] = rows.map(r => ({
      fundName: r.fundName, isin: r.isin, assetClass: r.assetClass,
      instruction: r.instruction as "Buy"|"Sell"|"Switch",
      allocationPct: r.allocationPct, valueZAR: r.valueZAR,
      units:         r.units        ? Number(r.units)        : undefined,
      pricePerUnit:  r.pricePerUnit ? Number(r.pricePerUnit) : undefined,
      switchFromFund: r.switchFrom || undefined,
    }));
    const instTypes = new Set(holdings.map(h => h.instruction));
    const instruction = instTypes.size === 1
      ? [...instTypes][0] as "Buy"|"Sell"|"Switch" : "Mixed";
    onSave({
      id:            `T-${Date.now()}`,
      importDate:    today,
      platform, clientId,
      clientName:    client?.name ?? clientId,
      reference, tradeDate, settlementDate,
      status:        "Pending",
      instruction,
      totalValueZAR: holdings.reduce((s, h) => s + h.valueZAR, 0),
      currency:      "ZAR",
      holdings, notes,
      _importedFrom: "excel",
    });
  }

  return (
    <div className="card import-panel">
      <div className="import-panel-heading">
        <div className="import-panel-title">
          Import trade sheet
          {step !== "form" && (
            <span className="import-step-indicator">
              {step === "mapper" ? " — Step 2: Map columns" : " — Step 3: Review"}
            </span>
          )}
        </div>
        <button className="import-panel-cancel" onClick={onCancel}>Cancel</button>
      </div>

      {/* ── Step 1: form + file upload ── */}
      {step === "form" && (
        <>
          <div className="import-form-grid">
            <div className="import-field">
              <label>Platform *</label>
              <select value={platform} onChange={e => updatePlatform(e.target.value as Platform)}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="import-field">
              <label>Client *</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">— select client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="import-field">
              <label>Reference number</label>
              <input type="text" value={reference} onChange={e => setReference(e.target.value)} />
            </div>
            <div className="import-field">
              <label>Trade date</label>
              <input type="date" value={tradeDate} onChange={e => setTradeDate(e.target.value)} />
            </div>
            <div className="import-field">
              <label>Settlement date</label>
              <input type="date" value={settlementDate} onChange={e => setSettlementDate(e.target.value)} />
            </div>
            <div className="import-field full">
              <label>Notes</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Mandate reference, IC approval, client instructions…" />
            </div>
          </div>

          <div
            className={`file-drop-zone${isDragOver ? " drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <span className="drop-icon">📂</span>
            <div className="drop-title">Drop a trade file here, or click to browse</div>
            <div className="drop-sub">Any column order — you will map the columns in the next step</div>
            <div className="drop-formats">
              {[".xlsx",".xls",".csv"].map(f => <span key={f} className="drop-format-tag">{f}</span>)}
            </div>
            <button className="drop-template-btn" onClick={e => { e.stopPropagation(); downloadTemplate(); }}>
              ↓ Download template
            </button>
          </div>
        </>
      )}

      {/* ── Step 2: column mapper ── */}
      {step === "mapper" && (
        <div className="col-mapper">
          <div className="col-mapper-intro">
            <span className="col-mapper-file">📄 {fileName}</span>
            <span className="col-mapper-count">{headers.length} column{headers.length !== 1 ? "s" : ""} detected</span>
          </div>

          <div className="col-mapper-grid">
            <div className="col-mapper-section-label">Required fields</div>
            {REQUIRED_FIELDS.map(field => (
              <MapRow key={field} field={field} headers={headers} colMap={colMap}
                onChange={(f, v) => setColMap(prev => ({ ...prev, [f]: v }))} />
            ))}
            <div className="col-mapper-section-label" style={{ marginTop: 10 }}>Optional fields</div>
            {OPTIONAL_FIELDS.map(field => (
              <MapRow key={field} field={field} headers={headers} colMap={colMap}
                onChange={(f, v) => setColMap(prev => ({ ...prev, [f]: v }))} />
            ))}
          </div>

          <div className="import-actions">
            <button className="import-panel-cancel" onClick={() => { setStep("form"); setFileName(""); }}>
              ← Back
            </button>
            <button className="btn-primary"
              disabled={REQUIRED_FIELDS.some(f => colMap[f] < 0)}
              onClick={confirmMapping}>
              Confirm mapping →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: preview ── */}
      {step === "preview" && (
        <>
          <div className="import-preview">
            <div className="import-preview-title">
              Preview — {rows.length} rows
              {errorCount > 0 && (
                <span className="import-preview-warn">⚠ {errorCount} row{errorCount > 1 ? "s have" : " has"} errors</span>
              )}
            </div>
            {totalAlloc !== 100 && errorCount === 0 && (
              <div className="import-alloc-warn">
                ⚠ Allocations sum to {totalAlloc.toFixed(2)}% — should be 100%
              </div>
            )}
            <div className="preview-table-wrap">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Fund name</th><th>ISIN</th><th>Asset class</th>
                    <th>Instruction</th><th>Alloc %</th><th>Value ZAR</th><th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={r._error ? "preview-row-error" : ""}>
                      <td>{r.fundName || "—"}</td>
                      <td><span className="holdings-isin">{r.isin || "—"}</span></td>
                      <td>{r.assetClass || "—"}</td>
                      <td>{r.instruction || "—"}</td>
                      <td>{r._error ? "—" : `${r.allocationPct}%`}</td>
                      <td>{r._error ? "—" : fmt(r.valueZAR)}</td>
                      <td style={{ color:"var(--negative)", fontSize:11 }}>{r._error ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="import-actions">
            <button className="import-panel-cancel" onClick={() => setStep("mapper")}>← Back</button>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {!clientId ? "Select a client first." :
               errorCount > 0 ? `Fix ${errorCount} error${errorCount > 1 ? "s" : ""} to save.` :
               "Ready to save."}
            </span>
            <button className="btn-primary" disabled={!canSave} onClick={handleSave}>
              Save trade
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MapRow({
  field, headers, colMap, onChange,
}: { field: FieldKey; headers: string[]; colMap: ColumnMap; onChange: (f: FieldKey, v: number) => void }) {
  const idx = colMap[field] ?? -1;
  const isRequired = REQUIRED_FIELDS.includes(field);
  const autoOk     = idx >= 0;

  return (
    <div className="col-map-row">
      <span className="col-map-field">
        {FIELD_LABELS[field]}
        {isRequired && <span className="col-map-required">*</span>}
      </span>
      <select
        className={`col-map-select${autoOk ? " detected" : ""}`}
        value={idx}
        onChange={e => onChange(field, Number(e.target.value))}
      >
        <option value={-1}>— skip / not in file —</option>
        {headers.map((h, i) => (
          <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
        ))}
      </select>
      <span className={`col-map-status${autoOk ? " ok" : ""}`}>
        {autoOk ? "✓ Auto-detected" : "—"}
      </span>
    </div>
  );
}
