// Parked: replaced by Meetings & Notes (Outlook is the calendar)
import { useApp } from "../../context/AppContext";
import { calendarEvents, pageData } from "../../data";
import { dateKey } from "../../utility/formatters";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const { state, dispatch } = useApp();
  const data = pageData["calendar"];

  const year = state.calendarMonth.getFullYear();
  const month = state.calendarMonth.getMonth();
  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const today = dateKey(new Date());

  const eventsByDate: Record<string, typeof calendarEvents> = {};
  calendarEvents.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const monthLabel = state.calendarMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const selectedEvents = eventsByDate[state.selectedCalendarDate] ?? [];

  function prevMonth() {
    dispatch({ type: "SET_CALENDAR_MONTH", month: new Date(year, month - 1, 1) });
  }
  function nextMonth() {
    dispatch({ type: "SET_CALENDAR_MONTH", month: new Date(year, month + 1, 1) });
  }

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>{data.title}</h1>
          <p className="page-heading-sub">{data.subtitle}</p>
        </div>
      </div>

      <div className="calendar-layout">
        <div>
          <div className="cal-nav">
            <button className="btn btn-ghost btn-sm" onClick={prevMonth}>‹</button>
            <span className="cal-nav-title">{monthLabel}</span>
            <button className="btn btn-ghost btn-sm" onClick={nextMonth}>›</button>
          </div>
          <div className="cal-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="cal-header-cell">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} className="cal-cell other-month" />;
              const dk = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasEvents = !!eventsByDate[dk];
              return (
                <div
                  key={dk}
                  className={`cal-cell${dk === today ? " today" : ""}${dk === state.selectedCalendarDate ? " selected" : ""}`}
                  onClick={() => dispatch({ type: "SET_CALENDAR_DATE", date: dk })}
                >
                  <span className="cal-day-num">{day}</span>
                  {hasEvents && <span className="cal-event-dot" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="event-sidebar">
          <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 8 }}>
            {state.selectedCalendarDate}
          </div>
          {selectedEvents.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>No events on this day.</p>
          ) : (
            selectedEvents.map((ev) => (
              <div key={ev.id} className={`event-card${ev.category === "meeting" ? " meeting" : ""}`}>
                <div className="event-card-time">{ev.time}</div>
                <div className="event-card-title">{ev.title}</div>
                <div className="event-card-desc">{ev.description}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
