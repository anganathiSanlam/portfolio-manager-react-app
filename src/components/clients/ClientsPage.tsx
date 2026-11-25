import { useEffect, useState } from "react";
import { useActiveTab } from "../common/tabs/useActiveTab";
import Tabs from "../common/tabs/Tabs";
import SourceBadge from "../common/source-badge/SourceBadge";
import ProgressRing from "../common/charts/ProgressRing";
import { getClientsData, type Client, type ClientsData } from "../../connectors/clients";
import { useApp } from "../../context/AppContext";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const DETAIL_TABS = [
  { id: "overview",  label: "Overview" },
  { id: "funds",     label: "Funds" },
  { id: "meetings",  label: "Meetings" },
  { id: "notes",     label: "Notes" },
];

type FilterType = "all" | "model" | "bespoke";
type StatusFilter = "all" | "on-track" | "below-target" | "at-risk";

export default function ClientsPage() {
  const { state, dispatch } = useApp();
  const [data, setData] = useState<ClientsData | null>(null);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => { getClientsData().then(setData); }, []);

  const clients = data?.clients ?? [];

  const filtered = clients.filter(c => {
    if (typeFilter !== "all" && c.portfolioType !== typeFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.modelPortfolio ?? "").toLowerCase().includes(q) || c.tags.some(t => t.includes(q));
    }
    return true;
  });

  const selected = clients.find(c => c.id === state.selectedClientId) ?? clients[0] ?? null;

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Clients</h1>
          <p className="page-heading-sub">Client relationships, portfolios, and meeting history</p>
        </div>
        {data && <SourceBadge meta={data._meta} />}
      </div>

      <div className="clients-layout">
        {/* ── LEFT: CLIENT LIST ── */}
        <div className="clients-sidebar">
          <input
            className="clients-search"
            placeholder="Search clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="clients-filter-row">
            {(["all", "model", "bespoke"] as FilterType[]).map(f => (
              <button
                key={f}
                className={`pill${typeFilter === f ? " active" : ""}`}
                onClick={() => setTypeFilter(f)}
              >
                {f === "all" ? "All" : f === "model" ? "Model" : "Bespoke"}
              </button>
            ))}
          </div>

          <div className="clients-filter-row">
            {(["all", "on-track", "below-target", "at-risk"] as StatusFilter[]).map(f => (
              <button
                key={f}
                className={`pill${statusFilter === f ? " active" : ""}`}
                onClick={() => setStatusFilter(f)}
              >
                {f === "all" ? "Any status" : f === "on-track" ? "On track" : f === "below-target" ? "Below target" : "At risk"}
              </button>
            ))}
          </div>

          <div className="clients-count">{filtered.length} client{filtered.length !== 1 ? "s" : ""}</div>

          {filtered.length === 0 && (
            <div className="clients-empty">
              <span className="clients-empty-icon">👤</span>
              <span>No clients match this filter</span>
            </div>
          )}

          {filtered.map(c => (
            <div
              key={c.id}
              className={`client-card${c.id === state.selectedClientId ? " selected" : ""}`}
              onClick={() => dispatch({ type: "SET_SELECTED_CLIENT", id: c.id })}
            >
              <div className="client-card-top">
                <span className="client-card-name">{c.name}</span>
                <span className="client-card-aum">{c.aumDisplay}</span>
              </div>
              <div className="client-card-meta">
                {c.entityType === "individual" ? "Individual" : c.entityType === "trust" ? "Trust" : "Institution"}
                {" · "}
                {c.portfolioType === "model" ? c.modelPortfolio : "Bespoke mandate"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <div className="client-card-tags">
                  <span className={`client-tag ${c.portfolioType}`}>
                    {c.portfolioType === "model" ? "Model" : "Bespoke"}
                  </span>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>

        {/* ── RIGHT: CLIENT DETAIL ── */}
        {selected ? (
          <ClientDetail client={selected} />
        ) : (
          <div className="clients-empty">
            <span className="clients-empty-icon">👤</span>
            <span>Select a client</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── STATUS BADGE ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    "on-track": "On track",
    "below-target": "Below target",
    "at-risk": "At risk",
  };
  return <span className={`client-status ${status}`}>{labels[status] ?? status}</span>;
}

/* ─── CLIENT DETAIL ─────────────────────────────────────────── */
function ClientDetail({ client }: { client: Client }) {
  const tab = useActiveTab("clients-detail", "overview");

  const onTrack = client.actualReturn >= client.targetReturn;

  return (
    <div className="client-detail">
      {/* Header */}
      <div className="card">
        <div className="client-detail-header">
          <div className="client-detail-title-row">
            <div className="client-detail-name">{client.name}</div>
            <div className="client-detail-entity">
              {client.entityType === "individual" ? "Individual" : client.entityType === "trust" ? "Trust" : "Institution"}
              {" · "}
              {client.portfolioType === "model" ? client.modelPortfolio : "Bespoke mandate"}
              {" · "}Since {client.since}
            </div>
            <div className="client-detail-badges">
              <StatusBadge status={client.status} />
              <span className={`client-tag ${client.portfolioType}`}>
                {client.portfolioType === "model" ? "Model portfolio" : "Bespoke"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--brand-primary)" }}>{client.aumDisplay}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>AUM</span>
          </div>
        </div>

        <div className="client-contact-row" style={{ marginTop: 10 }}>
          <span className="client-contact-item"><span className="client-contact-icon">📞</span>{client.phone}</span>
          <span className="client-contact-item"><span className="client-contact-icon">✉</span>{client.email}</span>
          <span className="client-contact-item"><span className="client-contact-icon">👤</span>{client.adviser}</span>
          <span className="client-contact-item"><span className="client-contact-icon">🗓</span>Last contact {new Date(client.lastContact).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="client-kpi-strip">
        <div className="client-kpi-cell">
          <div className="client-kpi-label">AUM</div>
          <div className="client-kpi-value" style={{ color: "var(--brand-primary)" }}>{client.aumDisplay}</div>
          <div className="client-kpi-sub">{client.portfolioType === "model" ? "Model portfolio" : "Bespoke mandate"}</div>
        </div>
        <div className="client-kpi-cell">
          <div className="client-kpi-label">Actual return</div>
          <div className="client-kpi-value" style={{ color: onTrack ? "var(--positive)" : "var(--negative)" }}>
            {client.actualReturn}%
          </div>
          <div className="client-kpi-sub">p.a.</div>
        </div>
        <div className="client-kpi-cell">
          <div className="client-kpi-label">Target return</div>
          <div className="client-kpi-value">{client.targetReturn}%</div>
          <div className="client-kpi-sub">p.a.</div>
        </div>
        <div className="client-kpi-cell">
          <div className="client-kpi-label">Goal date</div>
          <div className="client-kpi-value" style={{ fontSize: 16 }}>
            {new Date(client.goalDate).getFullYear()}
          </div>
          <div className="client-kpi-sub">{client.goalLabel}</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs page="clients-detail" tabs={DETAIL_TABS} />

      {tab === "overview"  && <OverviewTab  client={client} />}
      {tab === "funds"     && <FundsTab     client={client} />}
      {tab === "meetings"  && <MeetingsTab  client={client} />}
      {tab === "notes"     && <NotesTab     client={client} />}
    </div>
  );
}

/* ─── OVERVIEW TAB ──────────────────────────────────────────── */
function OverviewTab({ client }: { client: Client }) {
  const onTrack = client.actualReturn >= client.targetReturn;
  const gap = (client.actualReturn - client.targetReturn).toFixed(1);
  const gapStr = parseFloat(gap) >= 0 ? `+${gap}pp` : `${gap}pp`;

  return (
    <div className="client-overview-grid">
      {/* Goal card */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Goal progress</div>
        <div className="client-goal-row">
          <ProgressRing actual={client.actualReturn} target={client.targetReturn} status={onTrack ? "on-track" : "behind"} size={96} />
          <div className="client-goal-text">
            <div className="client-goal-label">{client.goalLabel}</div>
            <div className="client-goal-meta">Goal date {new Date(client.goalDate).getFullYear()}</div>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={client.status} />
            </div>
            <div className="client-goal-returns">
              <div className="client-goal-return-item">
                <div className="client-goal-return-label">Actual</div>
                <div className="client-goal-return-val" style={{ color: onTrack ? "var(--positive)" : "var(--negative)" }}>
                  {client.actualReturn}%
                </div>
              </div>
              <div className="client-goal-return-item">
                <div className="client-goal-return-label">Target</div>
                <div className="client-goal-return-val">{client.targetReturn}%</div>
              </div>
              <div className="client-goal-return-item">
                <div className="client-goal-return-label">Gap</div>
                <div className="client-goal-return-val" style={{ color: parseFloat(gap) >= 0 ? "var(--positive)" : "var(--negative)" }}>
                  {gapStr}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client info */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Client details</div>
        <div className="client-info-grid">
          <div className="client-info-item">
            <div className="client-info-label">Entity</div>
            <div className="client-info-val">{client.entityType === "individual" ? "Individual" : client.entityType === "trust" ? "Trust" : "Institution"}</div>
          </div>
          <div className="client-info-item">
            <div className="client-info-label">Client since</div>
            <div className="client-info-val">{client.since}</div>
          </div>
          <div className="client-info-item">
            <div className="client-info-label">Adviser</div>
            <div className="client-info-val">{client.adviser}</div>
          </div>
          <div className="client-info-item">
            <div className="client-info-label">Last contact</div>
            <div className="client-info-val">{new Date(client.lastContact).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
          <div className="client-info-item">
            <div className="client-info-label">Portfolio type</div>
            <div className="client-info-val" style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span className={`client-tag ${client.portfolioType}`}>
                {client.portfolioType === "model" ? "Model" : "Bespoke"}
              </span>
            </div>
          </div>
          {client.modelPortfolio && (
            <div className="client-info-item">
              <div className="client-info-label">Model portfolio</div>
              <div className="client-info-val">{client.modelPortfolio}</div>
            </div>
          )}
        </div>
        {client.tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 12 }}>
            {client.tags.map(t => <span key={t} className="client-tag">{t}</span>)}
          </div>
        )}
      </div>

      {/* Growth chart — full width */}
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="card-title" style={{ marginBottom: 12 }}>Growth of R100 invested</div>
        <div className="client-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={client.growthSeries} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <YAxis tickFormatter={v => `R${v}`} tick={{ fontSize: 11, fill: "var(--text-muted)" }} domain={["auto", "auto"]} />
              <Tooltip formatter={(v) => `R${v}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="portfolio" name="Portfolio" stroke="var(--brand-primary)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="target" name="Target" stroke="var(--warning)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Background notes */}
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Background</div>
        <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, margin: 0 }}>{client.notes}</p>
      </div>
    </div>
  );
}

/* ─── FUNDS TAB ─────────────────────────────────────────────── */
function FundsTab({ client }: { client: Client }) {
  if (client.portfolioType === "model") {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div className="client-model-info">
          <span className="client-model-icon">📊</span>
          <div>
            <strong>{client.name}</strong> is on the <strong>{client.modelPortfolio}</strong> model portfolio.
            All clients sharing this model have the same underlying fund allocations.
            <span style={{ display: "block", marginTop: 4, fontSize: 11, opacity: 0.75 }}>
              To see the full fund breakdown, navigate to Prepare → TAA or Research → Screening.
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Model portfolio clients</div>
          <ModelPortfolioClients modelPortfolio={client.modelPortfolio!} currentId={client.id} />
        </div>
      </div>
    );
  }

  const allocs = client.allocations ?? [];
  const total = allocs.reduce((s, a) => s + a.weight, 0);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Bespoke allocation — {allocs.length} funds</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{client.aumDisplay} total</span>
      </div>

      <table className="client-alloc-table">
        <thead>
          <tr>
            <th>Fund</th>
            <th>Asset class</th>
            <th style={{ minWidth: 160 }}>Weight</th>
            <th style={{ textAlign: "right" }}>AUM est.</th>
          </tr>
        </thead>
        <tbody>
          {allocs.map(a => (
            <tr key={a.fundId}>
              <td>
                <div className="client-fund-name">{a.fundName}</div>
              </td>
              <td><span className="client-fund-class">{a.assetClass}</span></td>
              <td>
                <div className="client-weight-bar-wrap">
                  <div className="client-weight-track">
                    <div className="client-weight-fill" style={{ width: `${Math.min(100, a.weight / 30 * 100)}%` }} />
                  </div>
                  <span className="client-weight-pct">{a.weight}%</span>
                </div>
              </td>
              <td style={{ textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>
                R{(client.aum * a.weight / 100).toFixed(1)}m
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="client-alloc-total">
        Total {total}%
      </div>
    </div>
  );
}

function ModelPortfolioClients({ modelPortfolio, currentId }: { modelPortfolio: string; currentId: string }) {
  const { dispatch } = useApp();
  const [data, setData] = useState<ClientsData | null>(null);

  useEffect(() => { getClientsData().then(setData); }, []);

  const peers = (data?.clients ?? []).filter(c => c.portfolioType === "model" && c.modelPortfolio === modelPortfolio);
  const totalAum = peers.reduce((s, c) => s + c.aum, 0);

  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
        {peers.length} client{peers.length !== 1 ? "s" : ""} · R{totalAum.toFixed(0)}m total AUM on {modelPortfolio}
      </div>
      {peers.map(c => (
        <div
          key={c.id}
          onClick={() => dispatch({ type: "SET_SELECTED_CLIENT", id: c.id })}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: "1px solid var(--border)",
            cursor: "pointer",
            fontWeight: c.id === currentId ? 700 : 400,
            color: c.id === currentId ? "var(--brand-primary)" : "var(--text)",
            fontSize: 13,
          }}
        >
          <span>{c.name} {c.id === currentId && <span style={{ fontSize: 10, color: "var(--brand-accent)" }}>← current</span>}</span>
          <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.aumDisplay}</span>
            <StatusBadge status={c.status} />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── MEETINGS TAB ──────────────────────────────────────────── */
function MeetingsTab({ client }: { client: Client }) {
  const upcoming = client.meetings.filter(m => m.status === "upcoming");
  const done     = client.meetings.filter(m => m.status === "done");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {upcoming.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Upcoming</div>
          <div className="client-meetings-list">
            {upcoming.map(m => <MeetingRow key={m.id} meeting={m} />)}
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Past meetings</div>
        {done.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>No past meetings recorded.</div>
        ) : (
          <div className="client-meetings-list">
            {done.map(m => <MeetingRow key={m.id} meeting={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingRow({ meeting }: { meeting: { id: string; date: string; title: string; outcome: string; status: string } }) {
  return (
    <div className={`client-meeting-row ${meeting.status}`}>
      <div className="client-meeting-date">
        {new Date(meeting.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
      </div>
      <div>
        <div className="client-meeting-title">{meeting.title}</div>
        {meeting.outcome && <div className="client-meeting-outcome">{meeting.outcome}</div>}
      </div>
      <span className={`client-meeting-badge ${meeting.status}`}>
        {meeting.status === "done" ? "Done" : "Upcoming"}
      </span>
    </div>
  );
}

/* ─── NOTES TAB ─────────────────────────────────────────────── */
function NotesTab({ client }: { client: Client }) {
  const { state, dispatch } = useApp();
  const saved = state.clientNotes[client.id] ?? client.notes;
  const [draft, setDraft] = useState(saved);

  const isDirty = draft !== saved;

  function save() {
    dispatch({ type: "SET_CLIENT_NOTE", clientId: client.id, note: draft });
  }

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div className="card-header">
        <span className="card-title">PM notes — {client.name}</span>
        {isDirty && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Unsaved changes</span>}
      </div>
      <textarea
        className="client-notes-area"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={8}
      />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        {isDirty && (
          <button className="btn-outline" onClick={() => setDraft(saved)}>Discard</button>
        )}
        <button className="btn-primary" onClick={save} disabled={!isDirty}>
          {isDirty ? "Save notes" : "Saved ✓"}
        </button>
      </div>
    </div>
  );
}
