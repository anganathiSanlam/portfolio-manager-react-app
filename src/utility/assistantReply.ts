import {
  calendarEvents, fundUniverse, managerUniverse, pageData, auditRecords, noteRecords, newsItems
} from "../data";

export interface AssistantResponse {
  text: string;
  source?: string;
  screen?: string;
  freshness?: string;
}

const DATA_DATE = "19 Nov 2026";

export function assistantReply(message: string, selectedCalendarDate: string): AssistantResponse {
  const q = message.toLowerCase();

  // Calendar / meetings / events / deadlines
  if (/calendar|meeting|event|deadline|upcoming/.test(q)) {
    const upcoming = calendarEvents
      .filter(e => e.date >= selectedCalendarDate)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 4);
    if (!upcoming.length) {
      return {
        text: "No further events in the sample calendar after the selected date.",
        source: "Calendar", screen: "calendar", freshness: `Demo data · ${DATA_DATE}`
      };
    }
    const lines = upcoming.map(e => `${e.title} — ${e.date} at ${e.time} (${e.category}, ${e.portfolio})`);
    return {
      text: `Next ${upcoming.length} events:\n${lines.join("\n")}`,
      source: "Calendar", screen: "calendar", freshness: `Demo data · ${DATA_DATE}`
    };
  }

  // Specific fund: Northstar
  if (/northstar/.test(q)) {
    const f = fundUniverse.find(x => x.id === "northstar")!;
    return {
      text: `${f.name} (${f.role}) — weight ${f.weight}, fee ${f.fee}, rating ${f.rating}. ${f.returnSummary}. ${f.driftSummary}. ${f.reviewSummary}`,
      source: `Funds · ${f.name}`, screen: "funds", freshness: `Returns as at 16 Nov · demo data`
    };
  }

  // Specific fund: Umzi
  if (/umzi/.test(q)) {
    const f = fundUniverse.find(x => x.id === "umzi")!;
    return {
      text: `${f.name} (${f.role}) — weight ${f.weight}, fee ${f.fee}, rating ${f.rating}. ${f.returnSummary}. ${f.driftSummary}. ${f.reviewSummary}`,
      source: `Funds · ${f.name}`, screen: "funds", freshness: `Returns as at 16 Nov · demo data`
    };
  }

  // Specific fund: Protea
  if (/protea/.test(q)) {
    const f = fundUniverse.find(x => x.id === "protea")!;
    return {
      text: `${f.name} (${f.role}) — weight ${f.weight}, fee ${f.fee}, rating ${f.rating}. ${f.returnSummary}. ${f.driftSummary}. ${f.reviewSummary}`,
      source: `Funds · ${f.name}`, screen: "funds", freshness: `Returns as at 16 Nov · demo data`
    };
  }

  // Fees / costs / charges
  if (/fee|cost|charge|ter/.test(q)) {
    const metrics = pageData.fees?.metrics ?? [];
    const totalCost = metrics.find(m => m[0] === "Total fund cost");
    const savings = metrics.find(m => m[0] === "Savings identified");
    const fundFees = fundUniverse.map(f => `${f.name}: ${f.fee}`);
    return {
      text: `Weighted average TER: ${totalCost?.[1] ?? "—"} (${totalCost?.[2] ?? ""}). Savings identified: ${savings?.[1] ?? "—"} ${savings?.[2] ?? ""}.\nFund fees — ${fundFees.join("; ")}.`,
      source: "Fees & costs", screen: "fees", freshness: `Fee schedule as at 1 Sep · demo data`
    };
  }

  // Risk / mandate / limit / breach
  if (/risk|mandate|limit|breach|ceiling/.test(q)) {
    const metrics = pageData.risk?.metrics ?? [];
    const rows = pageData.risk?.rows ?? [];
    const withinMetric = metrics.find(m => m[0] === "Within limits");
    const totalMetric = metrics.find(m => m[0] === "Mandates monitored");
    const alertMetric = metrics.find(m => m[0] === "Risk alerts");
    const watchItems = rows.filter(r => r[5] !== "Within limit");
    const watchText = watchItems.length
      ? ` Watch items: ${watchItems.map(r => `${r[0]} ${r[1]} at ${r[2]} vs limit ${r[3]}`).join("; ")}.`
      : " All other items within limit.";
    return {
      text: `${withinMetric?.[1] ?? "—"} of ${totalMetric?.[1] ?? "—"} mandate checks within limits. Alerts: ${alertMetric?.[1] ?? "—"}.${watchText}`,
      source: "Risk & mandates", screen: "risk", freshness: `Mandate checks as at 08:02 · demo data`
    };
  }

  // Rebalance / cash / inflow / allocation / flows
  if (/rebalanc|cash|inflow|allocat|flow/.test(q)) {
    const metrics = pageData.rebalance?.metrics ?? [];
    const cashMetric = metrics.find(m => m[0] === "Unallocated cash");
    const targetMetric = metrics.find(m => m[0] === "Target equity");
    const tradesMetric = metrics.find(m => m[0] === "Proposed trades");
    return {
      text: `Unallocated cash: ${cashMetric?.[1] ?? "—"} (${cashMetric?.[2] ?? ""}). Target equity: ${targetMetric?.[1] ?? "—"} (${targetMetric?.[2] ?? ""}). Proposed trades: ${tradesMetric?.[1] ?? "—"} — ${tradesMetric?.[2] ?? ""}. No trades are placed automatically; your approval is required.`,
      source: "Rebalance & flows", screen: "rebalance", freshness: `Proposal as at 07:20 · demo data`
    };
  }

  // Funds (generic)
  if (/\bfund(s)?\b/.test(q)) {
    const lines = fundUniverse.map(f => `${f.name}: ${f.weight} weight, fee ${f.fee}, ${f.rating}`);
    const watches = fundUniverse.filter(f => f.rating.startsWith("B"));
    return {
      text: `${fundUniverse.length} funds in the universe.\n${lines.join("\n")}${watches.length ? `\nOn watch: ${watches.map(f => f.name).join(", ")}.` : ""}`,
      source: "Funds", screen: "funds", freshness: `Returns as at 16 Nov · demo data`
    };
  }

  // Managers
  if (/manager(s)?|\bfirm\b/.test(q)) {
    const lines = managerUniverse.map(m => `${m.manager} (${m.role}): ${m.assets}, ${m.rating}, ${m.review}`);
    return {
      text: lines.join("\n"),
      source: "Managers", screen: "managers", freshness: `Demo data · ${DATA_DATE}`
    };
  }

  // Today / summary / brief / daily
  if (/today|summary|brief|daily|morning/.test(q)) {
    const metrics = pageData.today?.metrics ?? [];
    const aumMetric = metrics.find(m => m[0] === "AUM");
    const retMetric = metrics.find(m => m[0] === "1-day return");
    const actMetric = metrics.find(m => m[0] === "Open actions");
    return {
      text: `AUM ${aumMetric?.[1] ?? "—"} (${aumMetric?.[2] ?? ""}). 1-day return ${retMetric?.[1] ?? "—"} vs ${retMetric?.[2] ?? ""}. Open actions: ${actMetric?.[1] ?? "—"} — ${actMetric?.[2] ?? ""}. No action is taken automatically.`,
      source: "Today", screen: "today", freshness: `Morning brief as at 08:02 · demo data`
    };
  }

  // Portfolios / AUM
  if (/portfolio(s)?|\baum\b/.test(q)) {
    const metrics = pageData.portfolios?.metrics ?? [];
    const rows = pageData.portfolios?.rows ?? [];
    const aumMetric = metrics.find(m => m[0] === "Assets under management");
    const countMetric = metrics.find(m => m[0] === "Portfolios");
    const above = metrics.find(m => m[0] === "Above benchmark");
    const lines = rows.map(r => `${r[0]}: AUM ${r[2]}, YTD ${r[4]}, ${r[5]}`);
    return {
      text: `${countMetric?.[1] ?? "—"} portfolios, total AUM ${aumMetric?.[1] ?? "—"} (${aumMetric?.[2] ?? ""}). ${above?.[1] ?? "—"} above benchmark on 12M.\n${lines.join("\n")}`,
      source: "Portfolios", screen: "portfolios", freshness: `1D returns as at today · demo data`
    };
  }

  // Committee
  if (/committee/.test(q)) {
    const metrics = pageData.committee?.metrics ?? [];
    const nextMtg = metrics.find(m => m[0] === "Next meeting");
    const agenda = metrics.find(m => m[0] === "Agenda items");
    const pack = metrics.find(m => m[0] === "Pack readiness");
    return {
      text: `Next committee: ${nextMtg?.[1] ?? "—"} at ${nextMtg?.[2] ?? ""}. Agenda items: ${agenda?.[1] ?? "—"} (${agenda?.[2] ?? ""}). Pack readiness: ${pack?.[1] ?? "—"} (${pack?.[2] ?? ""}).`,
      source: "Committee", screen: "committee", freshness: `Demo data · ${DATA_DATE}`
    };
  }

  // News / market updates
  if (/\bnews\b|market update|update(s)?/.test(q)) {
    const metrics = pageData.news?.metrics ?? [];
    const todayMetric = metrics.find(m => m[0] === "Updates today");
    const watchMetric = metrics.find(m => m[0] === "Flagged for review");
    const watchItems = newsItems.filter(n => n.impact === "watch");
    const watchText = watchItems.length
      ? ` Watch items: ${watchItems.map(n => n.headline).join("; ")}.`
      : "";
    return {
      text: `${todayMetric?.[1] ?? "—"} updates today (${todayMetric?.[2] ?? ""}). ${watchMetric?.[1] ?? "—"} flagged for review.${watchText}`,
      source: "News", screen: "news", freshness: `As of 08:02 · demo data`
    };
  }

  // Audit / trail
  if (/audit|trail/.test(q)) {
    const recent = auditRecords.slice(0, 4);
    const lines = recent.map(a => `${a.time}: ${a.event} (${a.status})`);
    return {
      text: `Recent audit events:\n${lines.join("\n")}`,
      source: "Audit trail", screen: "audit", freshness: `Events as at 08:02 · demo data`
    };
  }

  // Notes
  if (/\bnote(s)?\b/.test(q)) {
    const lines = noteRecords.map(n => `${n.label} — ${n.status}`);
    return {
      text: `${noteRecords.length} notes:\n${lines.join("\n")}`,
      source: "Notes", screen: "notes", freshness: `Demo data · ${DATA_DATE}`
    };
  }

  // Data health
  if (/data.?health|feed|reconcil/.test(q)) {
    const metrics = pageData["data-health"]?.metrics ?? [];
    const feeds = metrics.find(m => m[0] === "Feeds current");
    const checks = metrics.find(m => m[0] === "Checks passed");
    const conflict = metrics.find(m => m[0] === "Needs a person");
    return {
      text: `Feeds: ${feeds?.[1] ?? "—"} (${feeds?.[2] ?? ""}). Checks: ${checks?.[1] ?? "—"} (${checks?.[2] ?? ""}). Needs attention: ${conflict?.[1] ?? "—"} — ${conflict?.[2] ?? "—"}.`,
      source: "Data health", screen: "data-health", freshness: `Last sync 08:02 · demo data`
    };
  }

  // Agents
  if (/\bagent(s)?\b|automat/.test(q)) {
    const metrics = pageData.agents?.metrics ?? [];
    const active = metrics.find(m => m[0] === "Active agents");
    const checks = metrics.find(m => m[0] === "Checks completed");
    const decision = metrics.find(m => m[0] === "Needs your decision");
    return {
      text: `${active?.[1] ?? "—"} agents active (${active?.[2] ?? ""}). ${checks?.[1] ?? "—"} checks completed. ${decision?.[1] ?? "—"} items need your decision. Nothing is executed automatically.`,
      source: "Agents", screen: "agents", freshness: `Last run 08:02 · demo data`
    };
  }

  // Unsupported / unrecognised
  return {
    text: "I can answer questions about portfolios, funds (Northstar, Umzi, Protea), fees, risk limits, the rebalance proposal, upcoming calendar events, managers, the committee pack, news, notes, data health, or today's brief. Try asking about a specific fund, mandate, or event.",
    freshness: `Demo data · ${DATA_DATE}`
  };
}
