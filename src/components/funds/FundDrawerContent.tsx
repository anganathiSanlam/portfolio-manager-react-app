import { useApp } from "../../context/AppContext";
import { fundUniverse, managerUniverse } from "../../data";

export default function FundDrawerContent() {
  const { state } = useApp();
  const fund = fundUniverse.find((f) => f.id === state.drawerFundId);
  if (!fund) return null;

  const manager = managerUniverse.find((m) => m.manager === fund.manager);

  return (
    <div>
      <div className="drawer-section">
        <div className="drawer-section-label">Fund</div>
        <div style={{ fontSize: 15, fontWeight: 650, marginBottom: 4 }}>{fund.name}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>{fund.roleSummary}</div>

        <div className="drawer-row"><span className="drawer-row-label">Weight</span><span className="drawer-row-value">{fund.weight}</span></div>
        <div className="drawer-row"><span className="drawer-row-label">Fee</span><span className="drawer-row-value">{fund.fee}</span></div>
        <div className="drawer-row"><span className="drawer-row-label">Rating</span><span className="drawer-row-value">{fund.rating}</span></div>
        <div className="drawer-row"><span className="drawer-row-label">Next review</span><span className="drawer-row-value">{fund.reviewDate}</span></div>
        <div className="drawer-row"><span className="drawer-row-label">Volatility</span><span className="drawer-row-value">{fund.volatility}</span></div>
        <div className="drawer-row"><span className="drawer-row-label">Worst fall</span><span className="drawer-row-value">{fund.worstFall}</span></div>
        <div className="drawer-row"><span className="drawer-row-label">Top holding</span><span className="drawer-row-value">{fund.topHolding}</span></div>
        <div className="drawer-row"><span className="drawer-row-label">Fund size</span><span className="drawer-row-value">{fund.size}</span></div>

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
          <div style={{ marginBottom: 6 }}>{fund.returnSummary}</div>
          <div style={{ marginBottom: 6 }}>{fund.driftSummary}</div>
          <div>{fund.reviewSummary}</div>
        </div>
      </div>

      {manager && (
        <div className="drawer-section">
          <div className="drawer-section-label">Manager</div>
          <div style={{ fontSize: 14, fontWeight: 650, marginBottom: 4 }}>{manager.manager}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>{manager.role}</div>

          <div className="drawer-row"><span className="drawer-row-label">AUM</span><span className="drawer-row-value">{manager.assets}</span></div>
          <div className="drawer-row">
            <span className="drawer-row-label">Rating</span>
            <span className="drawer-row-value" style={{ color: manager.rating.startsWith("A") ? "var(--green)" : "var(--amber)" }}>{manager.rating}</span>
          </div>
          <div className="drawer-row">
            <span className="drawer-row-label">Approved</span>
            <span className="drawer-row-value" style={{ color: manager.approved ? "var(--green)" : "var(--amber)" }}>
              {manager.approved ? "Yes" : "Pending"}
            </span>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>{manager.review}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>{fund.team}</div>
        </div>
      )}
    </div>
  );
}
