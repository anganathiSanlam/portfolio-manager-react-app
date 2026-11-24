import { useEffect, useState } from "react";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import SourceBadge from "../common/source-badge/SourceBadge";
import { getSakanaData } from "../../connectors/sakana";
import { auditRecords } from "../../data";
import type { ConnectorMeta } from "../../connectors/types";
import "./sources.css";

const TABS = [
  { id: "connectors", label: "Connectors" },
  { id: "datahealth", label: "Data health" },
  { id: "audit",      label: "Audit trail" },
];

export default function SourcesPage() {
  const tab = useActiveTab("sources", "connectors");

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Sources</h1>
          <p className="page-heading-sub">Connected tools, data health and audit trail</p>
        </div>
      </div>
      <Tabs page="sources" tabs={TABS} />
      {tab === "connectors" && <ConnectorsTab />}
      {tab === "datahealth" && <DataHealthTab />}
      {tab === "audit"      && <AuditTab />}
    </div>
  );
}

/* ─── CONNECTORS ─────────────────────────────────────────── */

type ConnectorStatus = "live" | "simulated" | "late" | "pending";

interface ConnectorCard {
  id: string;
  name: string;
  status: ConnectorStatus;
  statusLabel: string;
  lastUpdate: string;
  provides: string[];
  usedBy: string[];
  url?: string;
}

const CONNECTORS: ConnectorCard[] = [
  { id: "trading-economics", name: "Trading Economics", status: "simulated", statusLabel: "Simulated", lastUpdate: "23 Nov 08:00", provides: ["Macro indicators (US CPI, US Fed, SA CPI, SA repo, USD/ZAR, Brent)", "Inflation series"], usedBy: ["Prepare → Macro", "Prepare → House view"], url: "https://tradingeconomics.com" },
  { id: "alphabeta", name: "AlphaBeta", status: "simulated", statusLabel: "Simulated", lastUpdate: "22 Nov 18:00", provides: ["Fund screening data", "Quartile history", "House view data", "Manager qualitative assessments"], usedBy: ["Research → Screening", "Prepare → House view", "Prepare → Monday pack"], url: "https://www.alphabeta.com" },
  { id: "evestments", name: "eVestments", status: "simulated", statusLabel: "Simulated", lastUpdate: "22 Nov 17:00", provides: ["Institutional manager analytics", "Peer universe rankings", "Attribution data"], usedBy: ["Research → Screening", "Research → Manager profile"], url: "https://app.evestments.com" },
  { id: "portfolio-builder", name: "PortfolioBuilder", status: "simulated", statusLabel: "Simulated", lastUpdate: "22 Nov 18:00", provides: ["Allocation targets", "Allowed ranges", "Efficient frontier", "PM vs model comparison"], usedBy: ["Prepare → Asset allocation"], url: "https://portfoliobuilder.sanlam.com" },
  { id: "performance-system", name: "Performance System", status: "simulated", statusLabel: "Simulated", lastUpdate: "22 Nov 17:30", provides: ["Fund returns vs benchmark", "Portfolio growth series", "Fee breakdown"], usedBy: ["Research → Manager profile", "Present → Client story"], url: "https://performance.sanlam.internal" },
  { id: "trade-za", name: "Trade ZA", status: "simulated", statusLabel: "Simulated", lastUpdate: "22 Nov 16:00", provides: ["Client outcomes", "Goal-based tracking", "Growth vs target"], usedBy: ["Present → Client story"], url: "https://tradeza.sanlam.internal" },
  { id: "sakana", name: "Sakana", status: "pending", statusLabel: "Pending setup", lastUpdate: "—", provides: ["TBC — pending API credentials"], usedBy: [], url: "https://sakana.ai" },
];

const STATUS_COLORS: Record<ConnectorStatus, { bg: string; text: string }> = {
  live:      { bg: "var(--positive-bg)",  text: "var(--positive)"  },
  simulated: { bg: "var(--brand-accent-soft)", text: "var(--brand-primary)" },
  late:      { bg: "var(--warning-bg)",   text: "var(--warning)"   },
  pending:   { bg: "var(--surface-2)",    text: "var(--text-muted)" },
};

interface CustomLink { id: string; name: string; url: string; description: string; }

function ConnectorsTab() {
  const [sakana, setSakana] = useState<string | null>(null);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(() => {
    try { return JSON.parse(localStorage.getItem("pm-custom-links") || "[]"); } catch { return []; }
  });
  const [linkForm, setLinkForm] = useState({ name: "", url: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { getSakanaData().then(d => setSakana(d.message)); }, []);

  function addLink() {
    if (!linkForm.name.trim() || !linkForm.url.trim()) return;
    const link: CustomLink = { id: String(Date.now()), name: linkForm.name.trim(), url: linkForm.url.trim(), description: linkForm.description.trim() };
    const updated = [...customLinks, link];
    setCustomLinks(updated);
    try { localStorage.setItem("pm-custom-links", JSON.stringify(updated)); } catch {}
    setLinkForm({ name: "", url: "", description: "" });
    setShowForm(false);
  }

  function deleteLink(id: string) {
    const updated = customLinks.filter(l => l.id !== id);
    setCustomLinks(updated);
    try { localStorage.setItem("pm-custom-links", JSON.stringify(updated)); } catch {}
  }

  return (
    <div className="sources-layout">
      <div className="connectors-grid">
        {CONNECTORS.map(c => {
          const sc = STATUS_COLORS[c.status];
          return (
            <div key={c.id} className="connector-card card">
              <div className="connector-header">
                <span className="connector-name">{c.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="connector-open-btn">Open ↗</a>
                  )}
                  <span className="connector-badge" style={{ background: sc.bg, color: sc.text }}>
                    {c.statusLabel}
                  </span>
                </div>
              </div>
              <div className="connector-update">Last update: {c.lastUpdate}</div>
              <div className="connector-section-label">Provides</div>
              <ul className="connector-list">
                {c.provides.map(p => <li key={p}>{p}</li>)}
              </ul>
              {c.usedBy.length > 0 && (
                <>
                  <div className="connector-section-label">Used by</div>
                  <div className="connector-used-by">
                    {c.usedBy.map(u => <span key={u} className="connector-used-tag">{u}</span>)}
                  </div>
                </>
              )}
              {c.id === "sakana" && sakana && (
                <div className="connector-pending-note">{sakana}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom links panel */}
      <div className="custom-links-section">
        <div className="custom-links-header">
          <span className="custom-links-title">Custom links</span>
          <button className="macro-add-btn" onClick={() => setShowForm(s => !s)}>
            {showForm ? "✕ Cancel" : "+ Add link"}
          </button>
        </div>
        {showForm && (
          <div className="custom-link-form card">
            <div className="macro-form-grid">
              <div className="macro-form-field">
                <label className="macro-form-label">Name *</label>
                <input className="macro-form-input" value={linkForm.name} onChange={e => setLinkForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Bloomberg terminal" />
              </div>
              <div className="macro-form-field">
                <label className="macro-form-label">URL *</label>
                <input className="macro-form-input" value={linkForm.url} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div className="macro-form-field macro-form-full">
              <label className="macro-form-label">Description</label>
              <input className="macro-form-input" value={linkForm.description} onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this link for?" />
            </div>
            <div className="macro-form-actions">
              <button className="btn-outline" onClick={addLink}>Add link</button>
              <button className="btn-ghost-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
        {customLinks.length > 0 && (
          <div className="custom-link-grid">
            {customLinks.map(l => (
              <div key={l.id} className="custom-link-card card">
                <div className="custom-link-header">
                  <span className="custom-link-name">{l.name}</span>
                  <button className="macro-custom-delete" onClick={() => deleteLink(l.id)}>×</button>
                </div>
                {l.description && <div className="custom-link-desc">{l.description}</div>}
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="connector-open-btn" style={{ marginTop: 8, display: "inline-block" }}>
                  {l.url.replace(/^https?:\/\//, "")} ↗
                </a>
              </div>
            ))}
          </div>
        )}
        {customLinks.length === 0 && !showForm && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", padding: "10px 0" }}>
            No custom links yet. Add a link to any external tool, report, or resource.
          </div>
        )}
      </div>

      {/* Conflict example */}
      <div className="card conflict-card">
        <div className="card-header">
          <span className="card-title">⚠ Data conflict — example</span>
          <span className="connector-badge" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>Needs resolution</span>
        </div>
        <p className="conflict-desc">
          Two sources report different October returns for <strong>Moderate portfolio</strong>.
          Choose the value to use for dependent calculations.
        </p>
        <div className="conflict-options">
          {[
            { source: "Performance System", value: "+8.4% (Oct)", meta: { source: "Performance System", asOf: "22 Nov 17:30", simulated: true } as ConnectorMeta },
            { source: "Platform Report",    value: "+8.1% (Oct)", meta: { source: "Platform Report", asOf: "22 Nov 07:45", simulated: true } as ConnectorMeta },
          ].map(opt => (
            <div key={opt.source} className="conflict-option">
              <div className="conflict-option-source">{opt.source}</div>
              <div className="conflict-option-value">{opt.value}</div>
              <SourceBadge meta={opt.meta} />
              <button className="conflict-use-btn">Use this value</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── DATA HEALTH ─────────────────────────────────────────── */

const FEEDS = [
  { feed: "Markets / FX / yields",       asOf: "08:02 today",    check: "Fresh",                    status: "ok"      },
  { feed: "Portfolio positions / returns",asOf: "16 Nov close",   check: "Return conflict",           status: "warn"    },
  { feed: "Fund holdings",                asOf: "31 Oct 2026",    check: "Expected monthly lag",      status: "ok"      },
  { feed: "Cash / flows",                 asOf: "07:50 today",    check: "Reconciled",                status: "ok"      },
  { feed: "Calendar / documents",         asOf: "11 Nov 2026",    check: "Current",                   status: "ok"      },
  { feed: "Mandate checks",               asOf: "08:02 today",    check: "247 / 248 passed",          status: "ok"      },
  { feed: "Manager fee schedules",        asOf: "1 Sep 2026",     check: "Agreed schedule",           status: "ok"      },
  { feed: "Platform reports",             asOf: "07:45 today",    check: "Source variance",           status: "warn"    },
];

function DataHealthTab() {
  return (
    <div className="sources-layout">
      <div className="dh-metric-row">
        {[
          { label: "Feeds current",  value: "7 / 8", note: "1 source variance" },
          { label: "Checks passed",  value: "247 / 248", note: "1 consistency exception" },
          { label: "Needs a person", value: "1 conflict", note: "October Moderate return" },
        ].map(m => (
          <div key={m.label} className="dh-metric-card card">
            <div className="dh-metric-label">{m.label}</div>
            <div className="dh-metric-value">{m.value}</div>
            <div className="dh-metric-note">{m.note}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="dh-table">
          <thead>
            <tr>
              <th>Feed</th>
              <th>As of</th>
              <th>Check</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {FEEDS.map(f => (
              <tr key={f.feed} className={`dh-row${f.status === "warn" ? " dh-row-warn" : ""}`}>
                <td className="dh-feed-name">{f.feed}</td>
                <td className="dh-as-of">{f.asOf}</td>
                <td>{f.check}</td>
                <td>
                  <span className={`dh-status-dot${f.status === "warn" ? " warn" : ""}`} />
                  {f.status === "warn" ? "Review" : "OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── AUDIT TRAIL ─────────────────────────────────────────── */

function AuditTab() {
  const [search, setSearch] = useState("");
  const filtered = auditRecords.filter(r =>
    !search || r.event.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sources-layout">
      <div className="audit-controls">
        <input
          className="audit-search"
          placeholder="Search events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="audit-metric-row">
          {[
            { label: "Events today", value: String(auditRecords.length) },
            { label: "Open / Flagged", value: String(auditRecords.filter(r => r.status === "Open" || r.status === "Flagged").length) },
            { label: "Confirmed", value: String(auditRecords.filter(r => r.status === "Confirmed").length) },
          ].map(m => (
            <div key={m.label} className="audit-mini-metric">
              <span className="audit-mini-label">{m.label}</span>
              <span className="audit-mini-value">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="audit-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const flagged = r.status === "Open" || r.status === "Flagged";
              return (
                <tr key={i} className={`audit-row${flagged ? " flagged" : ""}`}>
                  <td className="audit-time">{r.time}</td>
                  <td className="audit-event">{r.event}</td>
                  <td>
                    <span className={`audit-status-badge ${flagged ? "warn" : "ok"}`}>{r.status}</span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={3} className="audit-empty">No events match "{search}"</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
