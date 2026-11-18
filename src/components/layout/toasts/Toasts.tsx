import { useApp } from "../../../context/AppContext";

export default function Toasts() {
  const { state, dispatch } = useApp();

  if (state.toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {state.toasts.map((msg) => (
        <div key={msg} className="toast success">
          <span className="toast-icon">✓</span>
          <div className="toast-body">
            <div className="toast-title">{msg}</div>
          </div>
          <button
            className="icon-btn"
            style={{ marginLeft: "auto", width: 24, height: 24, fontSize: 12 }}
            onClick={() => dispatch({ type: "REMOVE_TOAST", message: msg })}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
