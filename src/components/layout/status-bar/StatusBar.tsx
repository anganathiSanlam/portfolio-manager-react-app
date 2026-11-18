import { useApp } from "../../../context/AppContext";

export default function StatusBar() {
  const { state } = useApp();

  return (
    <div className="statusbar">
      <span className="statusbar-item">
        <span className="statusbar-dot" />
        <span>Live data</span>
      </span>
      <span className="statusbar-sep">|</span>
      <span className="statusbar-item">
        <strong>Portfolio:</strong>&nbsp;{state.portfolio}
      </span>
      <span className="statusbar-sep">|</span>
      <span className="statusbar-item">
        <strong>Role:</strong>&nbsp;{state.selectedRole}
      </span>
      <span className="statusbar-sep">|</span>
      <span className="statusbar-item">
        Agents:&nbsp;
        <strong>{state.agentsPaused ? "paused" : "running"}</strong>
      </span>
    </div>
  );
}
