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

  return (
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
  );
}

