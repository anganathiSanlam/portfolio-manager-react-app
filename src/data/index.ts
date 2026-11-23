import type {
  NavItem, Portfolio, CalendarEvent, Fund, Manager,
  DemoRole, PageDataEntry, NoteRecord, AuditRecord, NewsItem,
  PortfolioMetrics, ClientOutcome
} from "./types";

export const navigation: NavItem[] = [
  { id: "today",      number: "01", label: "Today",      alert: true },
  { id: "portfolios", number: "02", label: "Portfolios" },
  { id: "funds",      number: "03", label: "Funds" },
  { id: "actions",    number: "04", label: "Actions",    alert: true },
  { id: "calendar",   number: "05", label: "Calendar" },
  { id: "control",    number: "06", label: "Control",    alert: true },
];

export const portfolios: Portfolio[] = [
  { name: "Moderate portfolio", meta: "Balanced · R4.82bn" },
  { name: "Conservative portfolio", meta: "Income focused · R2.16bn" },
  { name: "Aggressive portfolio", meta: "Growth focused · R1.43bn" }
];

export const calendarEvents: CalendarEvent[] = [
  { id: "risk-review", date: "2026-11-17", time: "14:30", title: "Portfolio risk review", category: "Review", portfolio: "Moderate portfolio", description: "Monthly risk and mandate check." },
  { id: "fee-conflict", date: "2026-11-17", time: "15:30", title: "Fee exception review", category: "Follow-up", portfolio: "Moderate portfolio", description: "Confirm the Northstar fee value against the manager schedule." },
  { id: "umzi-check-in", date: "2026-11-19", time: "10:30", title: "Umzi quarterly review", category: "Meeting", portfolio: "Conservative portfolio", description: "Review fixed-income positioning and fee terms." },
  { id: "committee-prep", date: "2026-11-24", time: "09:00", title: "Investment committee prep", category: "Deadline", portfolio: "All portfolios", description: "Finalise the December agenda and supporting evidence." },
  { id: "cash-flow-check", date: "2026-11-24", time: "14:00", title: "Cash-flow check-in", category: "Review", portfolio: "Moderate portfolio", description: "Confirm cash available for the proposed allocation." },
  { id: "northstar-review", date: "2026-11-26", time: "11:00", title: "Northstar manager review", category: "Meeting", portfolio: "Moderate portfolio", description: "Quarterly review of performance, style drift, and active fees." },
  { id: "report-draft", date: "2026-11-27", time: "16:00", title: "Client report draft due", category: "Deadline", portfolio: "All portfolios", description: "Review November commentary before client report sign-off." },
  { id: "client-report", date: "2026-11-30", time: "16:00", title: "Client reporting sign-off", category: "Deadline", portfolio: "All portfolios", description: "Approve monthly reporting before distribution." },
  { id: "fee-negotiation", date: "2026-12-01", time: "10:00", title: "Umzi fee negotiation", category: "Meeting", portfolio: "Conservative portfolio", description: "Discuss the proposed scale-based fee step-down." },
  { id: "committee-meeting", date: "2026-12-02", time: "09:00", title: "Investment committee", category: "Meeting", portfolio: "All portfolios", description: "Quarterly portfolio positioning and manager review." }
];

export const portfolioFunds: string[][] = [
  ["Northstar Global Equity", "10% / 12%", "+0.3pp", "1.00%", "B · On watch"],
  ["Umzi Fixed Income", "18% / 18%", "+0.1pp", "0.45%", "A · Retain"],
  ["Protea SA Equity", "15% / 15%", "−0.2pp", "0.80%", "A · Retain"],
  ["Other underlying funds", "57% / 55%", "−0.8pp", "0.74%", "Mixed"]
];

export const fundUniverse: Fund[] = [
  {
    id: "northstar", name: "Northstar Global Equity", role: "Global equity · quality growth",
    weight: "10.0%", excess: "−2.1pp", excessValue: -2.1, fee: "1.00%", rating: "B · On watch",
    reviewStatus: "B / Under review", reviewDate: "19 Nov",
    reviewSummary: "Quality-growth role is intact, but rising concentration and a recent style shift warrant a closer look.",
    returnSummary: "12M excess −2.1pp · MTD excess −1.8pp · 16 Nov", roleSummary: "Quality-growth global shares",
    driftSummary: "Now: more US mega-cap concentration", volatility: "15.2%", worstFall: "−18.6%",
    topHolding: "8.4%", sector: "31%", overlap: "42%", size: "R42bn",
    team: "No confirmed team changes since October", manager: "Northstar Asset Management"
  },
  {
    id: "umzi", name: "Umzi Fixed Income", role: "SA bonds · active duration",
    weight: "18.0%", excess: "+0.6pp", excessValue: 0.6, fee: "0.45%", rating: "A · Retain",
    reviewStatus: "A / Retain", reviewDate: "14 Dec",
    reviewSummary: "The active-duration role remains within the portfolio mandate and is adding value against its benchmark.",
    returnSummary: "12M excess +0.6pp · MTD excess −0.2pp · 16 Nov", roleSummary: "SA bonds · active duration",
    driftSummary: "Duration 6.2 years versus 5.4 benchmark", volatility: "5.8%", worstFall: "−8.1%",
    topHolding: "6.1%", sector: "Government 54%", overlap: "12%", size: "R18bn",
    team: "No confirmed team changes since September", manager: "Umzi Investments"
  },
  {
    id: "protea", name: "Protea SA Equity", role: "SA equity · value",
    weight: "15.0%", excess: "+1.2pp", excessValue: 1.2, fee: "0.80%", rating: "A · Retain",
    reviewStatus: "A / Retain", reviewDate: "09 Feb",
    reviewSummary: "The value-oriented South African equity role remains within mandate and ahead of its benchmark.",
    returnSummary: "12M excess +1.2pp · MTD excess +0.4pp · 16 Nov", roleSummary: "SA equity · value",
    driftSummary: "Value exposure remains within the expected range", volatility: "17.4%", worstFall: "−21.2%",
    topHolding: "9.2%", sector: "Financials 28%", overlap: "18%", size: "R26bn",
    team: "Research lead confirmed in October", manager: "Protea Capital"
  },
  {
    id: "global-index", name: "Global Equity Index", role: "Global equity · passive",
    weight: "8.0%", excess: "−0.1pp", excessValue: -0.1, fee: "0.20%", rating: "Approved · passive",
    reviewStatus: "Approved · passive", reviewDate: "30 Jun",
    reviewSummary: "Broad global equity exposure at a low cost, used as an approved passive alternative.",
    returnSummary: "12M excess −0.1pp · MTD excess +0.1pp · 16 Nov", roleSummary: "Broad global equity",
    driftSummary: "Style exposure remains close to the broad market", volatility: "14.8%", worstFall: "−17.9%",
    topHolding: "6.8%", sector: "Technology 27%", overlap: "42%", size: "R65bn",
    team: "Index-tracking mandate", manager: "Global Index Partners"
  },
  {
    id: "sa-bond-index", name: "SA Bond Index", role: "SA bonds · passive",
    weight: "16.0%", excess: "−0.1pp", excessValue: -0.1, fee: "0.18%", rating: "Approved · passive",
    reviewStatus: "Approved · passive", reviewDate: "30 Jun",
    reviewSummary: "Low-cost, broad South African bond market exposure within the approved fixed-income sleeve.",
    returnSummary: "12M excess −0.1pp · MTD excess +0.1pp · 16 Nov", roleSummary: "Broad SA bond market",
    driftSummary: "Duration remains close to the benchmark", volatility: "5.2%", worstFall: "−7.5%",
    topHolding: "8.0%", sector: "Government 61%", overlap: "38%", size: "R31bn",
    team: "Index-tracking mandate", manager: "SA Index Partners"
  }
];

export const managerUniverse: Manager[] = [
  { id: "northstar", name: "Northstar", fund: "Northstar Global Equity", role: "Global Equity", assets: "R300m", rating: "B · On watch", review: "Next review 19 November", approved: false, manager: "Northstar Asset Management" },
  { id: "umzi", name: "Umzi", fund: "Umzi Fixed Income", role: "Fixed Income", assets: "R540m", rating: "A · Retain", review: "Today · 10:30 quarterly review", approved: true, manager: "Umzi Investments" },
  { id: "protea", name: "Protea", fund: "Protea SA Equity", role: "SA Equity", assets: "R450m", rating: "A · Retain", review: "Next meeting 24 November", approved: true, manager: "Protea Capital" }
];

export const demoRoles: DemoRole[] = [
  { name: "PM · Luyolo", description: "Propose and approve within limits." },
  { name: "Assistant PM · Zinhle", description: "Prepare and propose · cannot approve." },
  { name: "CIO / Committee", description: "Approve committee-tier proposals." },
  { name: "Compliance & risk", description: "Check and block · cannot place." },
  { name: "Operations", description: "Place and confirm approved instructions." },
  { name: "PM · Independent reviewer", description: "Review controls · cannot approve your own proposal." }
];

export const pageData: Record<string, PageDataEntry> = {
  today: {
    eyebrow: "DAILY OVERVIEW", title: "Today",
    subtitle: "Moderate portfolio · evidence first, decisions in your hands.",
    metrics: [["AUM", "R4.82bn", "+R150m inflow today"], ["1-day return", "+0.24%", "Bench +0.19%"], ["Open actions", "3", "2 need your approval"], ["Agents", "5 running", "No errors"]],
    insight: ["Action needed", "New cash waiting to be allocated.", "R150m arrived this morning. A rebalance proposal is ready to review — no sales required, all mandates would remain within limits.", "Review proposal"]
  },
  portfolios: {
    eyebrow: "PORTFOLIO UNIVERSE", title: "Portfolios",
    subtitle: "A clear view of performance, positioning, and decisions across your book.",
    metrics: [["Portfolios", "12", "Across 3 model strategies"], ["Assets under management", "R8.41bn", "+2.4% this month"], ["Above benchmark", "8 of 12", "Rolling 12 months"], ["Open decisions", "3", "2 need your attention"]],
    insight: ["Portfolio watch", "Moderate is at its equity ceiling.", "The latest R150m inflow creates an opportunity to restore the strategic 60% equity target without selling existing positions.", "Review rebalance"],
    tableTitle: "Your portfolios",
    columns: ["Portfolio", "Strategy", "AUM", "1D return", "YTD return", "Status"],
    rows: [["Moderate portfolio", "Balanced · Moderate", "R4.82bn", "+0.24%", "+8.42%", "On track"], ["Conservative portfolio", "Income · Conservative", "R2.16bn", "+0.18%", "+6.12%", "On track"], ["Aggressive portfolio", "Growth · Aggressive", "R1.43bn", "+0.31%", "+11.08%", "Review"], ["Sanlam Global Balanced", "Multi-asset", "R0.82bn", "+0.22%", "+7.63%", "On track"]]
  },
  funds: {
    eyebrow: "INVESTMENT UNIVERSE", title: "Funds",
    subtitle: "Look through holdings, performance, flows, and exposure across underlying funds.",
    metrics: [["Underlying funds", "28", "Across current portfolios"], ["Total exposure", "R8.41bn", "Look-through value"], ["On watch", "2", "1 fee review · 1 data check"], ["Latest price", "08:02", "All core prices current"]],
    insight: ["Fund monitor", "Northstar Global Equity is on the review list.", "Active fees are above the agreed range. The manager's latest performance remains ahead of benchmark over three years.", "Review fund"],
    tableTitle: "Underlying funds",
    columns: ["Fund", "Manager", "Exposure", "Weight", "1Y return", "Status"],
    rows: [["Northstar Global Equity", "Northstar Asset Management", "R482m", "10.0%", "+14.8%", "Review"], ["Umzi Fixed Income", "Umzi Investments", "R868m", "18.0%", "+9.2%", "On track"], ["Protea SA Equity", "Protea Capital", "R723m", "15.0%", "+18.4%", "On track"], ["Cedar Multi-Asset Income", "Cedar Investment Partners", "R395m", "8.2%", "+8.1%", "On track"]]
  },
  managers: {
    eyebrow: "PARTNER OVERSIGHT", title: "Managers",
    subtitle: "Monitor mandate delivery and keep manager conversations moving.",
    metrics: [["Active managers", "9", "Across all mandates"], ["Due diligence", "2", "Reviews due this quarter"], ["Open conversations", "4", "1 awaiting your response"], ["Service level", "96%", "Rolling 90 days"]],
    insight: ["Manager attention", "Umzi fee review is ready for your input.", "The proposed fee step-down is supported by current scale. A draft conversation and supporting evidence are ready.", "Open conversation"],
    tableTitle: "Manager relationships",
    columns: ["Manager", "Mandates", "AUM", "Last review", "Next review", "Relationship"],
    rows: [["Umzi Investments", "3", "R1.24bn", "12 Sep 2026", "14 Dec 2026", "Active"], ["Northstar Asset Management", "2", "R1.02bn", "28 Oct 2026", "15 Jan 2027", "Review"], ["Protea Capital", "2", "R0.96bn", "07 Aug 2026", "09 Feb 2027", "Active"], ["Cedar Investment Partners", "2", "R0.72bn", "03 Nov 2026", "03 Feb 2027", "Active"]]
  },
  rebalance: {
    eyebrow: "PORTFOLIO ACTIONS", title: "Rebalance & flows",
    subtitle: "Put new cash to work and bring portfolios back within their target ranges.",
    metrics: [["Unallocated cash", "R150m", "Moderate portfolio"], ["Target equity", "60.0%", "Current: 63.0%"], ["Proposed trades", "4", "No forced sales"], ["Awaiting approval", "1", "Prepared by portfolio agent"]],
    insight: ["Suggested action", "Invest the R150m inflow.", "Restore equity from 63% to 60% with new cash only. The proposal keeps all mandates inside limits and avoids selling into a weaker market.", "Review proposal"],
    tableTitle: "Rebalance proposals",
    columns: ["Proposal", "Portfolio", "Flow", "Target", "Impact", "Status"],
    rows: [["Invest the R150m inflow", "Moderate portfolio", "R150m", "60.0% equity", "No sales", "Awaiting approval"], ["October income allocation", "Conservative portfolio", "R24m", "Income sleeve", "Within bands", "Ready"], ["Quarter-end drift check", "Aggressive portfolio", "—", "65% equity", "2.1% drift", "Monitoring"]]
  },
  risk: {
    eyebrow: "CONTROL & OVERSIGHT", title: "Risk & mandates",
    subtitle: "See where portfolios sit against investment policy and risk limits.",
    metrics: [["Mandates monitored", "24", "Across 12 portfolios"], ["Within limits", "23", "One item needs review"], ["Equity ceiling", "63% / 65%", "Moderate portfolio"], ["Risk alerts", "1", "Low severity · explainable"]],
    insight: ["Mandate check", "Moderate is within its equity ceiling.", "Equity exposure is 63% against the 65% hard limit. The 60% strategic target is temporarily exceeded while the new inflow is allocated.", "View exposure"],
    tableTitle: "Mandate checks",
    columns: ["Portfolio", "Rule", "Current", "Limit", "Headroom", "Result"],
    rows: [["Moderate portfolio", "Listed equity", "63.0%", "65.0%", "2.0%", "Within limit"], ["Moderate portfolio", "Single manager", "18.0%", "25.0%", "7.0%", "Within limit"], ["Aggressive portfolio", "Offshore exposure", "38.4%", "40.0%", "1.6%", "Watch"], ["Conservative portfolio", "Below investment grade", "6.2%", "10.0%", "3.8%", "Within limit"]]
  },
  fees: {
    eyebrow: "COST MANAGEMENT", title: "Fees & costs",
    subtitle: "Understand what you are paying, track savings, and keep fee agreements current.",
    metrics: [["Total fund cost", "0.74%", "Weighted average TER"], ["Savings identified", "R2.4m", "vs prior schedule · annualised"], ["Fee reviews due", "2", "Northstar and Umzi"], ["Negotiation active", "1", "Umzi scale step-down"]],
    insight: ["Fee opportunity", "Northstar fee is above the agreed schedule.", "Active fee of 1.00% exceeds the agreed range. A draft conversation and supporting evidence are ready for your review.", "Review fee"]
  },
  calendar: {
    eyebrow: "UPCOMING WORK", title: "Calendar",
    subtitle: "See every review, meeting, and deadline in its place.",
    metrics: [["This week", "3 items", "2 reviews · 1 manager meeting"], ["Next review", "17 Nov", "Portfolio risk review"], ["Committee", "24 Nov", "Preparation meeting"], ["Overdue", "0", "You are up to date"]],
    insight: ["Coming up", "Northstar quarterly review is next week.", "The manager pack is being prepared. Recent performance, fee checks, and open actions will be included automatically.", "Open meeting"],
    listTitle: "Upcoming events"
  },
  notes: {
    title: "Notes", subtitle: "Keep research, decisions, and follow-ups connected to the right portfolio.",
    listTitle: "Notes with context",
    list: [["Umzi · quarterly review", "Today · draft minutes", "Umzi Fixed Income · Moderate", "Draft"], ["Northstar · position sizing", "22 October · shared", "Northstar Global Equity", "Shared"], ["Protea · team update", "29 September · shared", "Protea SA Equity", "Shared"], ["Committee · decision rationale", "20 August · final", "Moderate portfolio", "Final"]]
  },
  committee: {
    eyebrow: "GOVERNANCE", title: "Committee",
    subtitle: "Prepare decisions with a complete record of evidence and ownership.",
    metrics: [["Next meeting", "02 Dec", "09:00 SAST"], ["Agenda items", "6", "2 need an owner"], ["Pack readiness", "78%", "Evidence is being assembled"], ["Previous actions", "5 / 6", "One item carried forward"]],
    insight: ["Pack status", "The December committee pack is in progress.", "Portfolio performance and mandate checks are current. Two manager inputs are expected before the pack can be finalised.", "Open pack"],
    tableTitle: "Committee agenda",
    columns: ["Agenda item", "Portfolio", "Owner", "Evidence", "Due", "Status"],
    rows: [["Moderate portfolio positioning", "Moderate", "Luyolo", "Current", "24 Nov", "Ready"], ["Northstar manager review", "Moderate", "Thandi", "Awaiting input", "26 Nov", "In progress"], ["Quarterly mandate attestations", "All portfolios", "Operations", "Current", "28 Nov", "Ready"], ["Fee schedule and savings", "Moderate", "Luyolo", "Current", "30 Nov", "Ready"]]
  },
  news: {
    eyebrow: "MARKET INTELLIGENCE", title: "News",
    subtitle: "Market, manager, and macro updates linked to your funds and portfolios.",
    metrics: [["Updates today", "2", "Market and macro"], ["Flagged for review", "1", "Mandate headroom watch"], ["Manager updates", "1", "Protea team confirmed"], ["As of", "08:02", "19 Nov 2026"]]
  },
  agents: {
    eyebrow: "AI WORKFLOWS", title: "Agents",
    subtitle: "A transparent record of what your assistants are checking and preparing.",
    metrics: [["Active agents", "5", "Working across this workspace"], ["Checks completed", "27", "Since the start of today"], ["Needs your decision", "2", "Nothing is sent automatically"], ["Last run", "08:02", "All scheduled checks healthy"]],
    insight: ["Agent activity", "Your morning portfolio brief is ready.", "The portfolio monitoring agent checked 24 mandates, reconciled market moves, and prepared one cash-allocation proposal. No action was taken on your behalf.", "Review activity"],
    tableTitle: "Agent activity",
    columns: ["Agent", "Latest run", "Checks", "Prepared", "Permissions", "Status"],
    rows: [["Portfolio monitor", "08:02", "24 mandates", "1 proposal", "Read · Draft", "Healthy"], ["Fee reviewer", "07:54", "28 funds", "1 conversation", "Read · Draft", "Healthy"], ["Data reconciler", "07:46", "7 feeds", "1 exception", "Read only", "Review"], ["Committee assistant", "07:30", "6 agenda items", "2 summaries", "Read · Draft", "Healthy"]]
  },
  "data-health": {
    eyebrow: "DATA & CONNECTIVITY", title: "Data health",
    subtitle: "Moderate portfolio · evidence first, decisions in your hands.",
    metrics: [["Feeds current", "7 / 8", "Last sync 08:02"], ["Checks passed", "247 / 248", "1 consistency exception"], ["Needs a person", "1 conflict", "October Moderate return"]],
    insight: ["Needs review", "Same portfolio. Two reported returns.", "The October Moderate report differs between the performance system and platform report. Confirm the basis before dependent proposals proceed.", "Compare & choose source"],
    tableTitle: "Connected data feeds",
    columns: ["Feed", "As of", "Check", "Owner"],
    rows: [["Markets / FX / yields", "08:02 today", "Fresh", "Market data"], ["Portfolio positions / returns", "16 Nov close", "Return conflict", "Performance team"], ["Fund holdings", "31 Oct 2026", "Expected monthly lag", "Fund research"], ["Cash / flows", "07:50 today", "Reconciled", "Operations"], ["Calendar / documents", "11 Nov 2026", "Current", "Client services"], ["Mandate checks", "08:02 today", "247 / 248 passed", "Portfolio monitor"], ["Manager fee schedules", "1 Sep 2026", "Agreed schedule", "Fund research"], ["Platform reports", "07:45 today", "Source variance", "Performance team"]]
  },
  audit: {
    eyebrow: "CONTROL RECORD", title: "Audit trail",
    subtitle: "Moderate portfolio · evidence first, decisions in your hands.",
    metrics: [["Events today", "42", "Across 6 users and agents"], ["Approvals", "3", "All linked to evidence"], ["Exceptions", "1", "Open for review"], ["Retention", "7 years", "Firm policy"]],
    insight: ["Latest demo event", "Talking point linked to the Umzi meeting.", "The illustrative audit record is read-only and linked to its supporting decision chain.", "View record"],
    tableTitle: "Audit events",
    columns: ["Time", "Event", "Proposed by", "Approver", "Status"],
    rows: []
  }
};

export const noteRecords: NoteRecord[] = [
  {
    id: "umzi-quarterly", label: "Umzi · quarterly review", date: "Today · draft minutes",
    title: "Umzi Fixed Income / quarterly review", context: "Linked to manager · fund · meeting 17 Nov · Moderate",
    status: "Edited · unsaved draft", finalised: false, shared: true,
    talkingPoints: ["Explain the duration position and the trigger for changing it.", "Separate intentional positioning from security-selection effects.", "Confirm any team or ownership changes."],
    meetingRecord: "PM question: what yield change would make you reduce duration?",
    actionItems: ["Zinhle · prepare duration comparison · due 18 Nov", "Luyolo · confirm follow-up questions · due 17 Nov"],
    versions: [
      { label: "Version 1: agent-prepared talking points, 07:12.", title: "Umzi Fixed Income / quarterly review", talkingPoints: ["Explain the duration position and the trigger for changing it.", "Separate intentional positioning from security-selection effects."], meetingRecord: "PM question: what yield change would make you reduce duration?", actionItems: ["Zinhle · prepare duration comparison · due 18 Nov"] },
      { label: "Version 2: PM-edited talking point, sample.", title: "Umzi Fixed Income / quarterly review", talkingPoints: ["Explain the duration position and the trigger for changing it.", "Separate intentional positioning from security-selection effects.", "Confirm any team or ownership changes."], meetingRecord: "PM question: what yield change would make you reduce duration?", actionItems: ["Zinhle · prepare duration comparison · due 18 Nov", "Luyolo · confirm follow-up questions · due 17 Nov"] }
    ]
  },
  { id: "northstar-sizing", label: "Northstar · position sizing", date: "22 October · shared", title: "Northstar Global Equity / position sizing", context: "Linked to manager · fund · research review · Moderate", status: "Shared", finalised: false, shared: true, talkingPoints: ["Review the portfolio's position-size guardrails.", "Separate benchmark effects from active sizing decisions.", "Confirm the follow-up research owner."], meetingRecord: "Research review: position sizing needs a source-confirmed follow-up.", actionItems: ["Luyolo · confirm sizing rationale · due 24 Oct"], versions: [] },
  { id: "protea-team", label: "Protea · team update", date: "29 September · shared", title: "Protea SA Equity / team update", context: "Linked to manager · fund · team review · Moderate", status: "Shared", finalised: false, shared: true, talkingPoints: ["Confirm any material team or ownership changes.", "Review continuity of the investment process."], meetingRecord: "No material team or process changes were recorded in the sample review.", actionItems: ["Thandi · check next manager update · due 2 Dec"], versions: [] },
  { id: "committee-rationale", label: "Committee · decision rationale", date: "20 August · final", title: "Committee / decision rationale", context: "Linked to committee · meeting 20 Aug · Moderate", status: "Final · immutable", finalised: true, shared: true, talkingPoints: ["Record the evidence considered by the committee.", "Capture the decision and the accountable owner."], meetingRecord: "The committee recorded its decision against the available evidence and mandate checks.", actionItems: ["Luyolo · retain the approved record"], versions: [] }
];

export const auditRecords: AuditRecord[] = [
  { time: "08:02", event: "October return conflict raised", proposedBy: "Data quality agent", approver: "Pending PM", status: "Open", type: "fund", proposal: "" },
  { time: "07:28", event: "Mandates checked · 24 rules", proposedBy: "Monitoring agent", approver: "Automatic", status: "Logged", type: "portfolio", proposal: "" },
  { time: "07:20", event: "RB-041 · R150m allocation", proposedBy: "Rebalancing agent", approver: "Pending PM", status: "Draft", type: "proposal", proposal: "RB-041" },
  { time: "07:15", event: "October commentary drafted", proposedBy: "Reporting agent", approver: "Pending PM", status: "Flagged", type: "fund", proposal: "" },
  { time: "16 Nov", event: "RB-040 operations confirmation", proposedBy: "Operations", approver: "Luyolo", status: "Confirmed", type: "proposal", proposal: "RB-040" }
];

export const newsItems: NewsItem[] = [
  {
    id: "us-megacap-concentration",
    date: "19 Nov 2026", time: "07:45",
    headline: "US mega-cap concentration continues to rise",
    summary: "Top-10 US technology stocks now account for a higher share of MSCI World than at any point in the past five years, adding to the concentration risk flagged in Northstar's current review.",
    category: "Market", impact: "watch", linkedFundId: "northstar"
  },
  {
    id: "mpc-hold-sa-bonds",
    date: "18 Nov 2026", time: "15:20",
    headline: "SA bond yields edge lower after MPC holds rates",
    summary: "The Reserve Bank held the repo rate unchanged, supporting the case for Umzi's current extended-duration position. Yields on 10-year RSA bonds fell 8bps on the day.",
    category: "Macro", impact: "positive", linkedFundId: "umzi"
  },
  {
    id: "protea-team-confirmed",
    date: "14 Nov 2026", time: "10:00",
    headline: "Protea Capital confirms investment team stability",
    summary: "Protea Capital confirmed no changes to the investment team following last month's research review. The research lead who joined in October has begun contributing to portfolio decisions.",
    category: "Manager", impact: "positive", linkedFundId: "protea"
  },
  {
    id: "sa-equity-outperforms",
    date: "13 Nov 2026", time: "08:30",
    headline: "SA equity outperforms EM peers in October",
    summary: "The JSE All Share returned +3.4% in October against an EM benchmark of +1.8%, supported by resources and financials. The Moderate portfolio's SA equity sleeve benefited from this relative performance.",
    category: "Market", impact: "positive", linkedPortfolio: "Moderate portfolio"
  },
  {
    id: "currency-offshore-headroom",
    date: "12 Nov 2026", time: "09:10",
    headline: "Rand weakness narrows offshore mandate headroom",
    summary: "A 2.3% rand depreciation over the past fortnight has pushed the Aggressive portfolio's offshore exposure to 38.4% — approaching the 40% mandate limit currently flagged in Risk & mandates.",
    category: "Macro", impact: "watch", linkedPortfolio: "Aggressive portfolio"
  },
  {
    id: "global-index-rebalance",
    date: "11 Nov 2026", time: "16:00",
    headline: "MSCI index review — no material impact on passive sleeve",
    summary: "MSCI confirmed annual index review results. Changes to the Global Equity Index fund are within normal rebalancing ranges and are not expected to affect the portfolio's risk profile materially.",
    category: "Market", impact: "neutral", linkedFundId: "global-index"
  }
];

export const portfolioMetrics: Record<string, PortfolioMetrics> = {
  "Moderate portfolio": {
    aum: "R4.82bn", aumDelta: "+R150m today",
    return1d: "+0.24%", return1dBench: "Bench +0.19%",
    return1m: "+0.8%", return3m: "+2.1%", return1y: "+8.4%",
    ytd: "+8.42%", ytdBench: "Bench +7.90%",
    equity: "63.0%", openActions: "3"
  },
  "Conservative portfolio": {
    aum: "R2.16bn", aumDelta: "+R24m today",
    return1d: "+0.18%", return1dBench: "Bench +0.14%",
    return1m: "+0.5%", return3m: "+1.4%", return1y: "+6.1%",
    ytd: "+6.12%", ytdBench: "Bench +5.80%",
    equity: "28.0%", openActions: "1"
  },
  "Aggressive portfolio": {
    aum: "R1.43bn", aumDelta: "+R18m today",
    return1d: "+0.31%", return1dBench: "Bench +0.25%",
    return1m: "+1.2%", return3m: "+3.4%", return1y: "+11.1%",
    ytd: "+11.08%", ytdBench: "Bench +10.20%",
    equity: "72.0%", openActions: "2"
  },
};

export const clientOutcomes: ClientOutcome[] = [
  { portfolio: "Moderate portfolio",     target: "Inflation + 4% · 5-year horizon", targetReturn: "11.2%", actualReturn: "11.4%", status: "on-track", gap: "+0.2pp" },
  { portfolio: "Conservative portfolio", target: "Inflation + 2% · 3-year horizon", targetReturn: "9.2%",  actualReturn: "8.1%",  status: "behind",   gap: "−1.1pp" },
  { portfolio: "Aggressive portfolio",   target: "Inflation + 7% · 7-year horizon", targetReturn: "14.2%", actualReturn: "15.1%", status: "on-track",  gap: "+0.9pp" },
];

const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

export const portfolioChartData: Record<string, { portfolio: number[]; benchmark: number[]; months: string[] }> = {
  "Moderate portfolio": {
    portfolio:  [100, 100.8, 101.4, 102.3, 101.9, 103.1, 104.2, 105.1, 105.8, 106.5, 107.3, 108.4],
    benchmark:  [100, 100.6, 101.1, 102.0, 101.6, 102.7, 103.8, 104.5, 105.1, 105.8, 106.5, 107.9],
    months: MONTHS,
  },
  "Conservative portfolio": {
    portfolio:  [100, 100.5, 100.9, 101.5, 101.3, 102.0, 102.7, 103.2, 103.7, 104.3, 105.0, 106.1],
    benchmark:  [100, 100.4, 100.8, 101.4, 101.2, 101.8, 102.5, 103.0, 103.4, 104.0, 104.7, 105.8],
    months: MONTHS,
  },
  "Aggressive portfolio": {
    portfolio:  [100, 101.2, 102.1, 103.4, 102.5, 104.3, 106.1, 107.5, 108.4, 109.2, 110.1, 111.1],
    benchmark:  [100, 101.0, 101.8, 103.0, 102.1, 103.8, 105.4, 106.7, 107.5, 108.2, 109.1, 110.2],
    months: MONTHS,
  },
};

export const fundSparklines: Record<string, number[]> = {
  "northstar": [-0.1,  0.2,  0.3, -0.2,  0.4,  0.3,  0.1],
  "umzi":      [ 0.1,  0.0,  0.2,  0.1, -0.1,  0.1,  0.2],
  "protea":    [ 0.3,  0.4,  0.2,  0.5,  0.3,  0.4,  0.3],
  "cedar":     [ 0.1,  0.0,  0.1, -0.1,  0.0,  0.1,  0.1],
};
