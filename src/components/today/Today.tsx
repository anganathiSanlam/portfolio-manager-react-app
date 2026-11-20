import { useApp } from "../../context/AppContext";
import { calendarEvents, portfolioMetrics, newsItems } from "../../data";

const AGENT_ACTIVITY = [
  { label: "Rebalance proposal generated", time: "08:14", detail: "Equity drift +3.2pp detected — review ready" },
  { label: "Data health check passed",     time: "07:50", detail: "All 12 feeds green · 1 stale feed flagged" },
  { label: "News digest processed",        time: "07:30", detail: "6 items ingested · 1 linked to SA equity fund" },
];

const IMPACT_COLOR: Record<string, string> = {
  positive: "var(--green)",
  watch: "var(--amber)",
  neutral: "var(--muted)",
};

export default function Today() {
  const { state } = useApp();
  const m = portfolioMetrics[state.portfolio];

  const todayEvents = calendarEvents
    .filter((e) => e.portfolio === state.portfolio || e.portfolio === "all")
    .slice(0, 4);

  const topNews = newsItems.slice(0, 2);

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Today</h1>
          <p className="page-heading-sub">
            {state.portfolio}
            <span className="sample-data-label">Sample data</span>
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">AUM</div>
          <div className="metric-value">{m.aum}</div>
          <div className="metric-delta">{m.aumDelta}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">YTD return</div>
          <div className="metric-value">{m.ytd}</div>
          <div className="metric-delta">{m.ytdBench}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Today</div>
          <div className="metric-value">{m.return1d}</div>
          <div className="metric-delta">{m.return1dBench}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Open actions</div>
          <div className="metric-value">{m.openActions}</div>
          <div className="metric-delta">Pending review</div>
        </div>
      </div>

      <div className="today-grid">
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

        <div className="card">
          <div className="card-header">
            <span className="card-title">News brief</span>
          </div>
          <div className="events-list">
            {topNews.map((n) => (
              <div key={n.id} className="event-item">
                <div className="event-time" style={{ color: IMPACT_COLOR[n.impact] }}>{n.category}</div>
                <div>
                  <div className="event-title">{n.headline}</div>
                  <div className="event-sub">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">Handled for you</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Agents</span>
        </div>
        <div className="events-list">
          {AGENT_ACTIVITY.map((a) => (
            <div key={a.label} className="event-item">
              <div className="event-time">{a.time}</div>
              <div>
                <div className="event-title">{a.label}</div>
                <div className="event-sub">{a.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
