import { useApp } from "../../../context/AppContext";
import { auditRecords } from "../../../data";

export default function AuditCompanion() {
  const { state, dispatch } = useApp();
  const flaggedCount = auditRecords.filter((r) => r.status === "Open" || r.status === "Flagged").length;

  return (
    <aside className={`audit-panel${state.auditPanelOpen ? " open" : ""}`}>
      <div className="audit-panel-header">
        <div className="audit-panel-title">
          <span className="companion-header-dot" />
          Audit log
          {flaggedCount > 0 && (
            <span className="audit-panel-badge">{flaggedCount}</span>
          )}
        </div>
        <button
          className="audit-panel-close"
          onClick={() => dispatch({ type: "SET_AUDIT_PANEL_OPEN", open: false })}
          title="Close"
        >
          ✕
        </button>
      </div>
      <div className="companion-scroll">
        {auditRecords.map((entry, i) => {
          const flagged = entry.status === "Open" || entry.status === "Flagged";
          return (
            <div key={i} className={`companion-entry${flagged ? " flagged" : " ok"}`}>
              <div className="companion-entry-time">{entry.time}</div>
              <div className="companion-entry-text">{entry.event}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
