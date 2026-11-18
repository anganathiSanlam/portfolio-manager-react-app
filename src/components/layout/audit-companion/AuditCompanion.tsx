import { auditRecords } from "../../../data";

export default function AuditCompanion() {
  return (
    <aside className="audit-companion">
      <div className="companion-header">
        <span className="companion-header-dot" />
        Audit Companion
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
