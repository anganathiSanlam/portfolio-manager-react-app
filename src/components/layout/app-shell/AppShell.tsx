import { useEffect, type ReactNode } from "react";
import { useApp } from "../../../context/AppContext";
import Sidebar from "../sidebar/Sidebar";
import Topbar from "../topbar/Topbar";
import StatusBar from "../status-bar/StatusBar";
import AssistantPanel from "../assistant-panel/AssistantPanel";
import DetailDrawer from "../detail-drawer/DetailDrawer";
import AuditCompanion from "../audit-companion/AuditCompanion";
import Toasts from "../toasts/Toasts";

interface Props {
  children: ReactNode;
}

const BODY_CLASSES: Record<string, string> = {
  risk: "risk-active",
  notes: "notes-active",
  "data-health": "data-health-active",
  audit: "audit-active",
};

export default function AppShell({ children }: Props) {
  const { state } = useApp();

  useEffect(() => {
    const cls = BODY_CLASSES[state.activeSection] ?? "";
    document.body.className = cls;
    return () => { document.body.className = ""; };
  }, [state.activeSection]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <StatusBar />
        <div className="content-scroll">
          <div className="page-content">{children}</div>
        </div>
      </div>
      <AuditCompanion />
      <AssistantPanel />
      <DetailDrawer />
      <Toasts />
    </div>
  );
}
