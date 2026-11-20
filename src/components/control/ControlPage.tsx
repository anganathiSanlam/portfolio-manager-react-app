import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import GenericPage from "../generic-page/GenericPage";
import DataHealth from "../data-health/DataHealth";
import Audit from "../audit/Audit";

const TABS = [
  { id: "agents",      label: "Agents" },
  { id: "data-health", label: "Data health" },
  { id: "audit",       label: "Audit trail" },
];

export default function ControlPage() {
  const tab = useActiveTab("control", "agents");

  return (
    <div>
      <Tabs page="control" tabs={TABS} />
      {tab === "agents"      && <GenericPage section="agents" />}
      {tab === "data-health" && <DataHealth />}
      {tab === "audit"       && <Audit />}
    </div>
  );
}
