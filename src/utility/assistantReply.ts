import { calendarEvents } from "../data";

export function assistantReply(message: string, selectedCalendarDate: string): string {
  const query = message.toLowerCase();
  if (/calendar|meeting|event|deadline|upcoming/.test(query)) {
    const upcoming = calendarEvents.filter((item) => item.date >= selectedCalendarDate).slice(0, 3);
    if (upcoming.length === 0) return "There are no further events in this sample calendar. Use the month controls to review earlier dates.";
    return `Upcoming in this demo: ${upcoming.map((item) => `${item.title} on ${item.date} at ${item.time}`).join("; ")}.`;
  }
  if (/fee|cost|charge/.test(query)) {
    return "The Moderate portfolio fee example shows a 2.12% p.a. total ongoing charge, including 0.72% blended underlying fees. These figures are illustrative; confirm actual terms before relying on them.";
  }
  if (/risk|mandate|limit/.test(query)) {
    return "The demo shows 23 of 24 mandate checks within limits. Moderate equity is at 63% against a 65% ceiling; review the Risk & mandates section for the sample breakdown.";
  }
  if (/rebalance|cash|inflow/.test(query)) {
    return "A sample R150m inflow is ready for review. The proposal targets 60% equity without selling existing holdings; no trade is placed by this demo.";
  }
  if (/northstar|manager/.test(query)) {
    return "Northstar Global Equity is flagged for a fee review in the sample data. Open Managers or Funds to see the illustrative evidence and review context.";
  }
  if (/today|summary|brief/.test(query)) {
    return "Today's sample brief: markets moved, the Moderate portfolio is near its equity ceiling, and an R150m inflow proposal is waiting for your review. No action is taken automatically.";
  }
  return "I can summarize today's brief, explain fees or mandate checks, find calendar events, or describe the sample rebalance proposal. Responses use local demo data only.";
}
