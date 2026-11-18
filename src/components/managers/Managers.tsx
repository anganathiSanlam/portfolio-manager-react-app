import { useApp } from "../../context/AppContext";
import { managerUniverse, pageData } from "../../data";

export default function Managers() {
  const { state, dispatch } = useApp();
  const data = pageData["managers"];

  const filtered = managerUniverse.filter(
    (m) => state.managerFilter === "all" || m.role === state.managerFilter
  );

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>{data.title}</h1>
          <p className="page-heading-sub">{data.subtitle}</p>
        </div>
        <div className="page-heading-actions">
          <select
            className="filter-select"
            value={state.managerFilter}
            onChange={(e) => dispatch({ type: "SET_MANAGER_FILTER", filter: e.target.value })}
          >
            <option value="all">All roles</option>
            <option value="Core equity">Core equity</option>
            <option value="Fixed income">Fixed income</option>
            <option value="Global equity">Global equity</option>
          </select>
        </div>
      </div>

      {data.metrics && (
        <div className="metric-grid">
          {data.metrics.map(([label, value, delta]) => (
            <div key={label} className="metric-card">
              <div className="metric-label">{label}</div>
              <div className="metric-value">{value}</div>
              <div className="metric-delta">{delta}</div>
            </div>
          ))}
        </div>
      )}

      <div className="manager-cards">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="manager-card"
            onClick={() => dispatch({ type: "SET_MANAGER_VIEW", view: "detail", managerId: m.id })}
          >
            <div className="manager-avatar">
              {m.name.charAt(0)}
            </div>
            <div className="manager-name">{m.name}</div>
            <div className="manager-firm">{m.fund} · {m.role}</div>
            <div className="manager-stats">
              <div className="manager-stat">
                <div className="manager-stat-label">AUM</div>
                <div className="manager-stat-value">{m.assets}</div>
              </div>
              <div className="manager-stat">
                <div className="manager-stat-label">Rating</div>
                <div className={`manager-stat-value ${m.rating === "A" ? "green" : m.rating === "B" ? "" : "red"}`} style={{ color: m.rating === "A" ? "var(--green)" : m.rating === "B" ? "var(--amber)" : "var(--red)" }}>
                  {m.rating}
                </div>
              </div>
              <div className="manager-stat">
                <div className="manager-stat-label">Review</div>
                <div className="manager-stat-value">{m.review}</div>
              </div>
              <div className="manager-stat">
                <div className="manager-stat-label">Approved</div>
                <div className="manager-stat-value" style={{ color: m.approved ? "var(--green)" : "var(--amber)" }}>
                  {m.approved ? "Yes" : "Pending"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
