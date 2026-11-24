import { useApp } from "../../../context/AppContext";
import { navigation } from "../../../data";

export default function Sidebar() {
  const { state, dispatch } = useApp();

  return (
    <nav className="sidebar">
      <button className="brand" onClick={() => dispatch({ type: "SET_SECTION", id: "prepare" })}>
        <span className="brand-mark">PM</span>
        PM Insight
      </button>
      <span className="brand-caption">SANLAM MULTI-MANAGER</span>

      <span className="nav-caption">NAVIGATION</span>
      <div className="main-nav">
        {navigation.map((item) => (
          <div key={item.id}>
            {item.groupLabel && (
              <span className="nav-group-label">{item.groupLabel}</span>
            )}
            <button
              className={`nav-item${state.activeSection === item.id ? " active" : ""}`}
              onClick={() => dispatch({ type: "SET_SECTION", id: item.id })}
            >
              <span className="nav-number">{item.number}</span>
              <span className="nav-name">{item.label}</span>
              <span className={`nav-indicator${item.alert ? " has-alert" : ""}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="appearance">
          <span className="small-label">ACTIVE ROLE</span>
          <button
            className="profile-button"
            onClick={() => dispatch({ type: "SET_ROLE_MODAL_OPEN", open: true })}
          >
            <span className="profile-name">{state.selectedRole}</span>
            <span className="profile-hint">Click to switch role</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
