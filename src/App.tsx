import { AppProvider, useApp } from "./context/AppContext";
import AppShell from "./components/layout/app-shell/AppShell";
import Today from "./components/today/Today";
import Portfolios from "./components/portfolios/Portfolios";
import Funds from "./components/funds/Funds";
import Managers from "./components/managers/Managers";
import Rebalance from "./components/rebalance/Rebalance";
import Risk from "./components/risk/Risk";
import Fees from "./components/fees/Fees";
import Calendar from "./components/calendar/Calendar";
import Notes from "./components/notes/Notes";
import DataHealth from "./components/data-health/DataHealth";
import Audit from "./components/audit/Audit";
import News from "./components/news/News";
import "./components/news/news.css";
import GenericPage from "./components/generic-page/GenericPage";

function PageRouter() {
  const { state } = useApp();

  switch (state.activeSection) {
    case "today":       return <Today />;
    case "portfolios":  return <Portfolios />;
    case "funds":       return <Funds />;
    case "managers":    return <Managers />;
    case "rebalance":   return <Rebalance />;
    case "risk":        return <Risk />;
    case "fees":        return <Fees />;
    case "calendar":    return <Calendar />;
    case "notes":       return <Notes />;
    case "data-health": return <DataHealth />;
    case "audit":       return <Audit />;
    case "news":        return <News />;
    default:            return <GenericPage />;
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
