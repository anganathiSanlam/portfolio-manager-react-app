import { useRef, type KeyboardEvent } from "react";
import { useApp } from "../../../context/AppContext";

export interface TabDef {
  id: string;
  label: string;
}

interface Props {
  page: string;
  tabs: TabDef[];
}

// Full PM workflow — section → tab sequence
const FLOW: Array<{ section: string; tab: string; label: string }> = [
  { section: "prepare",  tab: "markets",      label: "Markets & themes" },
  { section: "prepare",  tab: "economy",      label: "Economy" },
  { section: "prepare",  tab: "valuations",   label: "Valuations" },
  { section: "prepare",  tab: "taa",          label: "TAA" },
  { section: "prepare",  tab: "pack",         label: "Pack" },
  { section: "research", tab: "screening",    label: "Screening" },
  { section: "research", tab: "profile",      label: "Manager profile" },
  { section: "research", tab: "meetprep",     label: "Meeting prep" },
  { section: "present",  tab: "clientstory",  label: "Client story" },
  { section: "present",  tab: "whitelabel",   label: "White label" },
];

export default function Tabs({ page, tabs }: Props) {
  const { state, dispatch } = useApp();
  const active = state.pageTab[page] ?? tabs[0]?.id ?? "";
  const listRef = useRef<HTMLDivElement>(null);

  function setTab(id: string) {
    dispatch({ type: "SET_PAGE_TAB", page, tab: id });
  }

  function handleKey(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % tabs.length;
      setTab(tabs[next].id);
      listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (idx - 1 + tabs.length) % tabs.length;
      setTab(tabs[prev].id);
      listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[prev]?.focus();
    }
  }

  // Linear flow nav
  const flowIdx = FLOW.findIndex(s => s.section === page && s.tab === active);
  const inFlow = flowIdx !== -1;
  const prevStep = inFlow && flowIdx > 0 ? FLOW[flowIdx - 1] : null;
  const nextStep = inFlow && flowIdx < FLOW.length - 1 ? FLOW[flowIdx + 1] : null;

  function goTo(step: typeof FLOW[0]) {
    if (step.section === page) {
      dispatch({ type: "SET_PAGE_TAB", page, tab: step.tab });
    } else {
      dispatch({ type: "SET_SECTION_AND_TAB", id: step.section, tab: step.tab });
    }
  }

  return (
    <div className="tabs-wrapper">
      <div className="page-tabs" role="tablist" ref={listRef}>
        {tabs.map((t, idx) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={`page-tab${active === t.id ? " active" : ""}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => handleKey(e, idx)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {inFlow && (
        <div className="flow-nav">
          <button
            className="flow-nav-btn"
            disabled={!prevStep}
            onClick={() => prevStep && goTo(prevStep)}
            title={prevStep ? `Back to ${prevStep.label}` : undefined}
          >
            ← {prevStep ? <span className="flow-nav-label">{prevStep.label}</span> : <span className="flow-nav-label">Start</span>}
          </button>
          <span className="flow-nav-step">{flowIdx + 1} / {FLOW.length}</span>
          <button
            className="flow-nav-btn flow-nav-btn-next"
            disabled={!nextStep}
            onClick={() => nextStep && goTo(nextStep)}
            title={nextStep ? `Next: ${nextStep.label}` : undefined}
          >
            {nextStep ? <span className="flow-nav-label">{nextStep.label}</span> : <span className="flow-nav-label">Done</span>} →
          </button>
        </div>
      )}
    </div>
  );
}

