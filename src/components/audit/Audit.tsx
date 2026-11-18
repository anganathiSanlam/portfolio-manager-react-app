import { useApp } from "../../context/AppContext";
import { auditRecords, demoRoles, pageData } from "../../data";

const TABS = ["Trail", "Approvals", "Roles"];

export default function Audit() {
  const { state, dispatch } = useApp();
  const data = pageData["audit"];
  const activeTab = state.auditModal || "Trail";

  const filtered = auditRecords.filter(
    (r) =>
      state.auditSearch === "" ||
      r.event.toLowerCase().includes(state.auditSearch.toLowerCase()) ||
      r.proposedBy.toLowerCase().includes(state.auditSearch.toLowerCase())
  );

  return (
    <div>
      <div className="page-heading" style={{ marginBottom: 0 }}>
        <div className="page-heading-text">
          <h1>{data.title}</h1>
          <p className="page-heading-sub">{data.subtitle}</p>
        </div>
        <div className="page-heading-actions">
          <input
            className="search-input"
            type="search"
            placeholder="Search audit…"
            value={state.auditSearch}
            onChange={(e) => dispatch({ type: "SET_AUDIT_SEARCH", search: e.target.value })}
          />
        </div>
      </div>

      <div className="audit-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`audit-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => dispatch({ type: "SET_AUDIT_MODAL", modal: tab })}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Trail" && (
        <div className="audit-trail">
          {filtered.map((entry, i) => (
            <div key={i} className="audit-entry">
              <span className="audit-entry-time">{entry.time}</span>
              <div>
                <div>{entry.event}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  Proposed by: {entry.proposedBy}
                </div>
              </div>
              <span className={`tag tag-${entry.status === "Confirmed" || entry.status === "Logged" ? "green" : entry.status === "Open" || entry.status === "Flagged" ? "amber" : "muted"}`}>
                {entry.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Approvals" && (
        <div className="approval-queue">
          {filtered.filter((r) => r.approver.startsWith("Pending")).map((entry, i) => (
            <div key={i} className="approval-item">
              <div className="approval-item-body">
                <div className="approval-item-title">{entry.event}</div>
                <div className="approval-item-meta">{entry.proposedBy} · {entry.time}</div>
              </div>
              <div className="approval-actions">
                <button
                  className="btn btn-primary btn-xs"
                  onClick={() => dispatch({ type: "APPROVE_DECISION", decision: entry.event })}
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
          {filtered.filter((r) => r.approver.startsWith("Pending")).length === 0 && (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>No pending approvals.</p>
          )}
        </div>
      )}

      {activeTab === "Roles" && (
        <div className="audit-role-grid">
          {demoRoles.map((role) => (
            <div key={role.name} className="role-card">
              <div className="role-card-header">
                <span className="role-card-name">{role.name}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 10px" }}>{role.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
