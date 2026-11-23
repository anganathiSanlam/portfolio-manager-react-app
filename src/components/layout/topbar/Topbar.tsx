import { useApp } from "../../../context/AppContext";
import { navigation, portfolios, auditRecords } from "../../../data";

const flaggedCount = auditRecords.filter((r) => r.status === "Open" || r.status === "Flagged").length;

export default function Topbar() {
  const { state, dispatch } = useApp();

  const current = navigation.find((n) => n.id === state.activeSection);

  function cyclePortfolio() {
    const idx = portfolios.findIndex((p) => p.name === state.portfolio);
    const next = portfolios[(idx + 1) % portfolios.length];
    dispatch({ type: "SET_PORTFOLIO", name: next.name });
  }

  return (
    <header className="topbar">
      <span className="topbar-title">
        {current?.label ?? "Dashboard"}
      </span>
      <div className="topbar-actions">
        <button className="portfolio-select" onClick={cyclePortfolio} title="Switch portfolio">
          <span className="portfolio-select-name">{state.portfolio}</span>
          <span className="portfolio-select-arrow">▾</span>
        </button>
        <button
          className={`icon-btn topbar-audit-btn${state.auditPanelOpen ? " active" : ""}`}
          title="Audit log"
          onClick={() => dispatch({ type: "SET_AUDIT_PANEL_OPEN", open: !state.auditPanelOpen })}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1.5a4.5 4.5 0 0 1 4.5 4.5c0 2.4.6 3.8 1.1 4.5H2.4c.5-.7 1.1-2.1 1.1-4.5A4.5 4.5 0 0 1 8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M6.5 10.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {flaggedCount > 0 && (
            <span className="topbar-audit-badge">{flaggedCount}</span>
          )}
        </button>
        <button
          className={`icon-btn${state.assistantOpen ? " active" : ""}`}
          title="AI Assistant"
          onClick={() => dispatch({ type: "SET_ASSISTANT_OPEN", open: !state.assistantOpen })}
        >
          ✦
        </button>
      </div>
    </header>
  );
}
