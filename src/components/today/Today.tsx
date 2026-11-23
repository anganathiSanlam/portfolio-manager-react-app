import { useApp } from "../../context/AppContext";
import { calendarEvents, portfolioMetrics, newsItems, portfolioChartData } from "../../data";
import LineChart from "../common/charts/LineChart";

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

const CATEGORY_ICON: Record<string, string> = {
  Market: "📈", Macro: "🌍", Manager: "🏢", Portfolio: "📂",
};

export default function Today() {
  const { state } = useApp();
  const m = portfolioMetrics[state.portfolio];
  const chart = portfolioChartData[state.portfolio];

  const todayEvents = calendarEvents
    .filter((e) => e.portfolio === state.portfolio || e.portfolio === "all")
    .slice(0, 4);

  const topNews = newsItems.slice(0, 2);

  const ytdNum = parseFloat(m.ytd);
  const ytdBenchNum = parseFloat(m.ytdBench.replace("Bench ", ""));
  const maxYtd = Math.max(ytdNum, ytdBenchNum, 1);

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

      {/* Hero AUM + returns */}
      <div className="today-hero">
        <div className="today-hero-aum">
          <div className="today-hero-aum-value">{m.aum}</div>
          <div className="today-hero-aum-delta">{m.aumDelta}</div>
        </div>
        <div className="today-hero-returns">
          <div className="today-return-row">
            <span className="today-return-row-label">YTD</span>
            <div className="today-return-row-track">
              <div className="today-return-row-fill portfolio" style={{ width: `${(ytdNum / maxYtd) * 100}%` }} />
            </div>
            <span className="today-return-row-value green">{m.ytd}</span>
          </div>
          <div className="today-return-row">
            <span className="today-return-row-label">Bench</span>
            <div className="today-return-row-track">
              <div className="today-return-row-fill bench" style={{ width: `${(ytdBenchNum / maxYtd) * 100}%` }} />
            </div>
            <span className="today-return-row-value muted">{m.ytdBench.replace("Bench ", "")}</span>
          </div>
          <div className="today-hero-mini-stats">
            <span>Today <strong className="green">{m.return1d}</strong></span>
            <span>1m <strong>{m.return1m}</strong></span>
            <span>Open actions <strong>{m.openActions}</strong></span>
          </div>
        </div>
      </div>

      {/* Line chart */}
      {chart && (
        <div className="card today-chart-card">
          <div className="card-header">
            <span className="card-title">12-month performance</span>
            <div className="today-chart-legend">
              <span className="today-legend-item portfolio">Portfolio</span>
              <span className="today-legend-item bench">Benchmark</span>
            </div>
          </div>
          <LineChart portfolio={chart.portfolio} benchmark={chart.benchmark} months={chart.months} />
        </div>
      )}

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
                <div className="event-time" style={{ color: IMPACT_COLOR[n.impact] }}>
                  {CATEGORY_ICON[n.category]} {n.category}
                </div>
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
