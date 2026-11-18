import { useApp } from "../../context/AppContext";
import { calendarEvents, pageData } from "../../data";
import { formatRand } from "../../utility/formatters";

export default function Today() {
  const { state } = useApp();
  const data = pageData["today"];

  const todayEvents = calendarEvents.filter(
    (e) => e.portfolio === state.portfolio || e.portfolio === "all"
  ).slice(0, 4);

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

      <div className="today-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Returns snapshot</span>
          </div>
          <div className="return-grid">
            {[
              ["1 month", "+0.8%", "Bench +0.6%"],
              ["3 months", "+2.1%", "Bench +1.9%"],
              ["1 year", formatRand(0) || "+8.4%", "Bench +7.9%"],
            ].map(([label, value, bench]) => (
              <div key={label} className="return-card">
                <div className="return-card-label">{label}</div>
                <div className="return-card-value green">{value}</div>
                <div className="return-card-bench">{bench}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Today&apos;s schedule</span>
          </div>
          <div className="events-list">
            {todayEvents.length === 0 ? (
              <p className="muted">No events today.</p>
            ) : (
              todayEvents.map((ev) => (
                <div key={ev.id} className="event-item">
                  <div className="event-time">{ev.time}</div>
                  <div>
                    <div className="event-title">{ev.title}</div>
                    <div className="event-sub">{ev.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {data.insight && (
        <div className="why-panel" style={{ marginTop: 20 }}>
          <div className="why-panel-label">{data.insight[0]}</div>
          <strong>{data.insight[1]}</strong>
          <p style={{ margin: "6px 0 0" }}>{data.insight[2]}</p>
        </div>
      )}
    </div>
  );
}
