import { AppProvider, useApp } from "./context/AppContext";
import AppShell from "./components/layout/app-shell/AppShell";
import Today from "./components/today/Today";
import Portfolios from "./components/portfolios/Portfolios";
import Funds from "./components/funds/Funds";
import ActionsPage from "./components/actions/ActionsPage";
import CalendarPage from "./components/calendar/CalendarPage";
import ControlPage from "./components/control/ControlPage";
import "./components/news/news.css";

function PageRouter() {
  const { state } = useApp();

  switch (state.activeSection) {
    case "today":      return <Today />;
    case "portfolios": return <Portfolios />;
    case "funds":      return <Funds />;
    case "actions":    return <ActionsPage />;
    case "calendar":   return <CalendarPage />;
    case "control":    return <ControlPage />;
    default:           return <Today />;
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
