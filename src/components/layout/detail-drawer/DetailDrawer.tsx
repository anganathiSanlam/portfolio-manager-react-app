import { useApp } from "../../../context/AppContext";

export default function DetailDrawer() {
  const { state, dispatch } = useApp();

  function close() {
    dispatch({ type: "CLOSE_DRAWER" });
  }

  return (
    <>
      <div
        className={`drawer-overlay${state.drawerOpen ? " open" : ""}`}
        onClick={close}
      />
      <aside className={`detail-drawer${state.drawerOpen ? " open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-header-text">
            <div className="drawer-title">{state.drawerTitle}</div>
            {state.drawerDescription && (
              <div className="drawer-subtitle">{state.drawerDescription}</div>
            )}
          </div>
          <button className="icon-btn drawer-close" onClick={close}>✕</button>
        </div>
        <div className="drawer-body">
          <p className="muted" style={{ fontSize: 13 }}>
            Detail content will appear here based on context.
          </p>
        </div>
      </aside>
    </>
  );
}
