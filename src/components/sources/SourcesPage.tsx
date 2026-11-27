import { useState } from "react";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import { auditRecords } from "../../data";
import "./sources.css";

const TABS = [
  { id: "platforms", label: "Platforms" },
  { id: "tools",     label: "Tools" },
  { id: "markets",   label: "Markets" },
  { id: "audit",     label: "Audit trail" },
];

export default function SourcesPage() {
  const tab = useActiveTab("sources", "platforms");

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Sources</h1>
          <p className="page-heading-sub">Quick access to platforms, tools and market data</p>
        </div>
      </div>
      <Tabs page="sources" tabs={TABS} />
      {tab === "platforms" && <AppTab category="platforms" />}
      {tab === "tools"     && <AppTab category="tools" />}
      {tab === "markets"   && <AppTab category="markets" />}
      {tab === "audit"     && <AuditTab />}
    </div>
  );
}

/* ─── SHARED TYPES ────────────────────────────────────────── */

type AppStatus = "live" | "simulated" | "pending";

interface AppEntry {
  id: string;
  name: string;
  tagline: string;
  url: string;
  status: AppStatus;
  statusLabel: string;
  custom?: boolean;
}

interface CustomApp { id: string; name: string; url: string; description: string; }

type Category = "platforms" | "tools" | "markets";

/* ─── HARDCODED APPS PER CATEGORY ────────────────────────── */

const PLATFORM_APPS: AppEntry[] = [
  {
    id: "ninetyone",
    name: "NinetyOne",
    tagline: "LISP platform — lock in and manage client trade instructions",
    url: "https://www.ninetyone.com",
    status: "live",
    statusLabel: "Live",
  },
  {
    id: "oldmutual",
    name: "Old Mutual",
    tagline: "LISP and investment platform — submit and track portfolio trades",
    url: "https://www.oldmutual.co.za",
    status: "live",
    statusLabel: "Live",
  },
  {
    id: "sanlam-wealth",
    name: "Sanlam Wealth",
    tagline: "LISP platform for Sanlam-managed portfolios and trade submissions",
    url: "https://www.sanlam.co.za/wealthmanagement",
    status: "live",
    statusLabel: "Live",
  },
  {
    id: "glacier",
    name: "Glacier Invest",
    tagline: "LISP platform — fund switches, purchases and trade tracking",
    url: "https://www.glacier.co.za",
    status: "live",
    statusLabel: "Live",
  },
];

const TOOL_APPS: AppEntry[] = [
  {
    id: "portfolio-builder",
    name: "PortfolioBuilder",
    tagline: "Internal tool — build allocation targets, ranges and efficient frontiers",
    url: "https://portfoliobuilder.sanlam.com",
    status: "simulated",
    statusLabel: "Simulated",
  },
  {
    id: "alphabeta",
    name: "AlphaBeta",
    tagline: "Fund screening, quartile history, house view and TAA analytics",
    url: "https://www.alphabeta.com",
    status: "simulated",
    statusLabel: "Simulated",
  },
  {
    id: "evestments",
    name: "eVestments",
    tagline: "Institutional analytics — peer rankings, attribution and manager due diligence",
    url: "https://app.evestments.com",
    status: "simulated",
    statusLabel: "Simulated",
  },
  {
    id: "sakana",
    name: "Sakana",
    tagline: "AI research assistant — pending API credentials and integration setup",
    url: "https://sakana.ai",
    status: "pending",
    statusLabel: "Pending setup",
  },
];

const MARKET_APPS: AppEntry[] = [
  {
    id: "bloomberg",
    name: "Bloomberg",
    tagline: "Market returns, valuations, EPS growth and global financial data",
    url: "https://www.bloomberg.com/professional",
    status: "simulated",
    statusLabel: "Simulated",
  },
  {
    id: "trading-economics",
    name: "Trading Economics",
    tagline: "Macro indicators, GDP, inflation, rates and country-level economic data",
    url: "https://tradingeconomics.com",
    status: "live",
    statusLabel: "Live",
  },
  {
    id: "imf",
    name: "IMF — World Economic Outlook",
    tagline: "GDP growth and inflation forecasts, global PMI heatmap",
    url: "https://www.imf.org/en/publications/weo",
    status: "live",
    statusLabel: "Live",
  },
  {
    id: "bca-research",
    name: "BCA Research",
    tagline: "Independent macro research — theme cards, narratives and chart data",
    url: "https://www.bcaresearch.com",
    status: "simulated",
    statusLabel: "Simulated",
  },
];

const CATEGORY_DATA: Record<Category, { apps: AppEntry[]; storageKey: string; emptyHint: string }> = {
  platforms: {
    apps: PLATFORM_APPS,
    storageKey: "pm-apps-platforms",
    emptyHint: "Add a trading platform or LISP portal the team uses.",
  },
  tools: {
    apps: TOOL_APPS,
    storageKey: "pm-apps-tools",
    emptyHint: "Add an internal tool or analytics platform.",
  },
  markets: {
    apps: MARKET_APPS,
    storageKey: "pm-apps-markets",
    emptyHint: "Add a market data or economic research site.",
  },
};

const STATUS_COLORS: Record<AppStatus, { bg: string; text: string }> = {
  live:      { bg: "var(--positive-bg)",       text: "var(--positive)"   },
  simulated: { bg: "var(--brand-accent-soft)",  text: "var(--brand-primary)" },
  pending:   { bg: "var(--surface-2)",          text: "var(--text-muted)" },
};

/* ─── APP TAB (shared by platforms / tools / markets) ─────── */

function AppTab({ category }: { category: Category }) {
  const { apps, storageKey, emptyHint } = CATEGORY_DATA[category];

  const [customApps, setCustomApps] = useState<CustomApp[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ name: "", url: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  function addApp() {
    if (!form.name.trim() || !form.url.trim()) return;
    const entry: CustomApp = {
      id: String(Date.now()),
      name: form.name.trim(),
      url: form.url.trim(),
      description: form.description.trim(),
    };
    const updated = [...customApps, entry];
    setCustomApps(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
    setForm({ name: "", url: "", description: "" });
    setShowForm(false);
  }

  function deleteApp(id: string) {
    const updated = customApps.filter(a => a.id !== id);
    setCustomApps(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
  }

  return (
    <div className="sources-layout">
      {/* Hardcoded app cards */}
      <div className="app-cards-grid">
        {apps.map(app => {
          const sc = STATUS_COLORS[app.status];
          return (
            <div key={app.id} className="app-card card">
              <div className="app-card-header">
                <span className="app-card-name">{app.name}</span>
                <span className="app-status-badge" style={{ background: sc.bg, color: sc.text }}>
                  {app.statusLabel}
                </span>
              </div>
              <p className="app-card-tagline">{app.tagline}</p>
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="app-open-btn"
              >
                Open {app.name} ↗
              </a>
            </div>
          );
        })}
      </div>

      {/* Custom apps section */}
      <div className="custom-apps-section">
        <div className="custom-apps-header">
          <span className="custom-apps-title">My apps</span>
          <button className="macro-add-btn" onClick={() => setShowForm(s => !s)}>
            {showForm ? "✕ Cancel" : "+ Add app"}
          </button>
        </div>

        {showForm && (
          <div className="app-add-form card">
            <div className="macro-form-grid">
              <div className="macro-form-field">
                <label className="macro-form-label">Name *</label>
                <input
                  className="macro-form-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Morningstar Direct"
                />
              </div>
              <div className="macro-form-field">
                <label className="macro-form-label">URL *</label>
                <input
                  className="macro-form-input"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="macro-form-field macro-form-full">
              <label className="macro-form-label">Description</label>
              <input
                className="macro-form-input"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What do you use this for?"
              />
            </div>
            <div className="macro-form-actions">
              <button className="btn-outline" onClick={addApp}>Add app</button>
              <button className="btn-ghost-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {customApps.length > 0 && (
          <div className="app-cards-grid">
            {customApps.map(a => (
              <div key={a.id} className="app-card app-card-custom card">
                <div className="app-card-header">
                  <span className="app-card-name">{a.name}</span>
                  <button className="app-delete-btn" onClick={() => deleteApp(a.id)} title="Remove">×</button>
                </div>
                {a.description && <p className="app-card-tagline">{a.description}</p>}
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-open-btn"
                >
                  Open ↗
                </a>
              </div>
            ))}
          </div>
        )}

        {customApps.length === 0 && !showForm && (
          <p className="custom-apps-empty">{emptyHint}</p>
        )}
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
            { label: "Events today",   value: String(auditRecords.length) },
            { label: "Open / Flagged", value: String(auditRecords.filter(r => r.status === "Open" || r.status === "Flagged").length) },
            { label: "Confirmed",      value: String(auditRecords.filter(r => r.status === "Confirmed").length) },
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
