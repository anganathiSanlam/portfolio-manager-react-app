import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { fundUniverse, pageData } from "../../data";

export default function Funds() {
  const { state, dispatch } = useApp();
  const data = pageData["funds"];
  const [search, setSearch] = useState("");

  const filtered = fundUniverse.filter(
    (f) =>
      (state.fundFilter === "all" || f.role === state.fundFilter) &&
      (search === "" ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>{data.title}</h1>
          <p className="page-heading-sub">{data.subtitle}</p>
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

      <div className="funds-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="Search funds…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={state.fundFilter}
          onChange={(e) => dispatch({ type: "SET_FUND_FILTER", filter: e.target.value })}
        >
          <option value="all">All roles</option>
          <option value="Core">Core</option>
          <option value="Satellite">Satellite</option>
          <option value="Specialist">Specialist</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="generic-table">
          <thead>
            <tr>
              <th>Fund</th>
              <th>Role</th>
              <th className="num">Weight</th>
              <th className="num">Excess</th>
              <th className="num">Fee</th>
              <th>Rating</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr
                key={f.id}
                onClick={() => dispatch({ type: "OPEN_DRAWER", title: f.name, description: f.roleSummary, fundId: f.id })}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <div className="fund-row-name">{f.name}</div>
                  <div className="fund-row-code">{f.id}</div>
                </td>
                <td>{f.role}</td>
                <td className="num">{f.weight}</td>
                <td className={`num ${parseFloat(f.excessValue.toString()) >= 0 ? "green" : "red"}`}>
                  {f.excess}
                </td>
                <td className="num">{f.fee}</td>
                <td>
                  <span className={`tag tag-${f.rating === "A" ? "green" : f.rating === "B" ? "amber" : "red"}`}>
                    {f.rating}
                  </span>
                </td>
                <td>
                  <span className={`tag tag-${f.reviewStatus === "Current" ? "green" : "amber"}`}>
                    {f.reviewStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
