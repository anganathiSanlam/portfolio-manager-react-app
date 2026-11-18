import { useApp } from "../../../context/AppContext";
import { navigation, portfolios } from "../../../data";

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
