import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import Rebalance from "../rebalance/Rebalance";
import GenericPage from "../generic-page/GenericPage";
import { auditRecords } from "../../data";

const TABS = [
  { id: "rebalance", label: "Rebalance & flows" },
  { id: "committee", label: "Committee" },
];

const proposed  = auditRecords.filter((r) => r.status === "Draft" || r.status === "Flagged").length;
const checked   = auditRecords.filter((r) => r.status === "Logged" || r.status === "Open").length;
const approved  = auditRecords.filter((r) => r.status === "Confirmed").length;
const done      = 3;

export default function ActionsPage() {
  const tab = useActiveTab("actions", "rebalance");

  return (
    <div>
      <div className="pipeline-header">
        <div className="pipeline-stage pipeline-stage-proposed">
          <span className="pipeline-stage-count">{proposed}</span>
          <span className="pipeline-stage-label">Proposed</span>
        </div>
        <span className="pipeline-arrow">›</span>
        <div className="pipeline-stage pipeline-stage-checked">
          <span className="pipeline-stage-count">{checked}</span>
          <span className="pipeline-stage-label">Checked</span>
        </div>
        <span className="pipeline-arrow">›</span>
        <div className="pipeline-stage pipeline-stage-approved">
          <span className="pipeline-stage-count">{approved}</span>
          <span className="pipeline-stage-label">Approved</span>
        </div>
        <span className="pipeline-arrow">›</span>
        <div className="pipeline-stage pipeline-stage-done">
          <span className="pipeline-stage-count">{done}</span>
          <span className="pipeline-stage-label">Done</span>
        </div>
      </div>

      <Tabs page="actions" tabs={TABS} />

      {tab === "rebalance"  && <Rebalance />}
      {tab === "committee"  && <GenericPage section="committee" />}
    </div>
  );
}
