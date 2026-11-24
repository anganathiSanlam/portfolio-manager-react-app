import { AppProvider, useApp } from "./context/AppContext";
import AppShell from "./components/layout/app-shell/AppShell";
import PreparePage from "./components/prepare/PreparePage";
import ResearchPage from "./components/research/ResearchPage";
import PresentPage from "./components/present/PresentPage";
import CalendarPage from "./components/calendar/CalendarPage";
import SourcesPage from "./components/sources/SourcesPage";

function PageRouter() {
  const { state } = useApp();

  switch (state.activeSection) {
    case "prepare":  return <PreparePage />;
    case "research": return <ResearchPage />;
    case "present":  return <PresentPage />;
    case "calendar": return <CalendarPage />;
    case "sources":  return <SourcesPage />;
    default:         return <PreparePage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <PageRouter />
      </AppShell>
    </AppProvider>
  );
}
