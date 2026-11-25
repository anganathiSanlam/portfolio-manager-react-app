import type { ConnectorMeta } from "./types";

export type ClientStatus = "on-track" | "below-target" | "at-risk";
export type ClientPortfolioType = "model" | "bespoke";
export type ClientEntityType = "individual" | "trust" | "institution";

export interface ClientAllocation {
  fundId: string;
  fundName: string;
  assetClass: string;
  weight: number; // %
}

export interface ClientMeeting {
  id: string;
  date: string;         // YYYY-MM-DD
  title: string;
  outcome: string;
  status: "done" | "upcoming";
}

export interface ClientGrowthPoint {
  month: string;
  portfolio: number;
  target: number;
}

export interface Client {
  id: string;
  name: string;
  entityType: ClientEntityType;
  portfolioType: ClientPortfolioType;
  modelPortfolio?: string;              // for model clients
  allocations?: ClientAllocation[];     // for bespoke clients
  aum: number;                          // Rm
  aumDisplay: string;
  status: ClientStatus;
  adviser: string;
  goalLabel: string;
  goalDate: string;                     // YYYY-MM-DD
  targetReturn: number;                 // % p.a.
  actualReturn: number;                 // % p.a.
  phone: string;
  email: string;
  meetings: ClientMeeting[];
  notes: string;
  tags: string[];
  lastContact: string;                  // ISO date
  since: string;                        // "2019"
  growthSeries: ClientGrowthPoint[];
}

export interface ClientsData {
  clients: Client[];
  _meta: ConnectorMeta;
}

const MONTHS_12 = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

function modGrowth(offset = 0): ClientGrowthPoint[] {
  return MONTHS_12.map((m, i) => ({
    month: m,
    portfolio: parseFloat((100 + offset + [0, 0.8, 1.4, 2.3, 1.9, 3.1, 4.2, 5.1, 5.8, 6.5, 7.3, 8.4][i]).toFixed(1)),
    target:    parseFloat((100 + offset + [0, 0.6, 1.1, 2.0, 1.6, 2.7, 3.8, 4.5, 5.1, 5.8, 6.5, 7.9][i]).toFixed(1)),
  }));
}

function consGrowth(offset = 0): ClientGrowthPoint[] {
  return MONTHS_12.map((m, i) => ({
    month: m,
    portfolio: parseFloat((100 + offset + [0, 0.5, 0.9, 1.5, 1.3, 2.0, 2.7, 3.2, 3.7, 4.3, 5.0, 6.1][i]).toFixed(1)),
    target:    parseFloat((100 + offset + [0, 0.4, 0.8, 1.4, 1.2, 1.8, 2.5, 3.0, 3.4, 4.0, 4.7, 5.8][i]).toFixed(1)),
  }));
}

function aggrGrowth(offset = 0): ClientGrowthPoint[] {
  return MONTHS_12.map((m, i) => ({
    month: m,
    portfolio: parseFloat((100 + offset + [0, 1.2, 2.1, 3.4, 2.5, 4.3, 6.1, 7.5, 8.4, 9.2, 10.1, 11.1][i]).toFixed(1)),
    target:    parseFloat((100 + offset + [0, 1.0, 1.8, 3.0, 2.1, 3.8, 5.4, 6.7, 7.5, 8.2, 9.1, 10.2][i]).toFixed(1)),
  }));
}

function bespokeGrowth(seq: number[]): ClientGrowthPoint[] {
  return MONTHS_12.map((m, i) => ({
    month: m,
    portfolio: parseFloat((100 + seq[i]).toFixed(1)),
    target:    parseFloat((100 + seq[i] - 0.4).toFixed(1)),
  }));
}

export async function getClientsData(): Promise<ClientsData> {
  return {
    clients: [
      /* ── MODEL CLIENTS ─────────────────────────────────── */
      {
        id: "c001", name: "Themba Nkosi", entityType: "individual",
        portfolioType: "model", modelPortfolio: "Moderate portfolio",
        aum: 4.8, aumDisplay: "R4.8m", status: "on-track",
        adviser: "PM · Luyolo", goalLabel: "Retirement at 65",
        goalDate: "2034-03-01", targetReturn: 11.2, actualReturn: 11.4,
        phone: "+27 82 345 6789", email: "themba.n@email.co.za",
        since: "2017", lastContact: "2026-11-10",
        tags: ["JSE-exposed", "long-horizon"],
        notes: "Themba is comfortable with moderate equity exposure. He checks in quarterly and prefers concise updates. Has a secondary RA with a competitor — may consolidate if performance holds.",
        meetings: [
          { id: "c001-m1", date: "2026-11-10", title: "Annual review", outcome: "Portfolio on track. Increased equity allocation discussed.", status: "done" },
          { id: "c001-m2", date: "2026-08-05", title: "Mid-year check-in", outcome: "No changes. Reaffirmed risk profile.", status: "done" },
          { id: "c001-m3", date: "2027-02-15", title: "Q1 2027 review", outcome: "", status: "upcoming" },
        ],
        growthSeries: modGrowth(),
      },
      {
        id: "c002", name: "Liezel du Plessis", entityType: "individual",
        portfolioType: "model", modelPortfolio: "Conservative portfolio",
        aum: 2.2, aumDisplay: "R2.2m", status: "on-track",
        adviser: "PM · Luyolo", goalLabel: "Capital preservation · income",
        goalDate: "2029-06-01", targetReturn: 9.2, actualReturn: 9.5,
        phone: "+27 83 456 7890", email: "liezel.dp@gmail.com",
        since: "2020", lastContact: "2026-10-22",
        tags: ["income", "low-risk"],
        notes: "Recently retired. Primarily concerned with income stability and capital preservation. Sensitive to drawdowns. Has a property in Cape Town she may liquidate to top up the portfolio.",
        meetings: [
          { id: "c002-m1", date: "2026-10-22", title: "Quarterly review", outcome: "Satisfied with income. Queried global bond exposure.", status: "done" },
          { id: "c002-m2", date: "2027-01-20", title: "Q1 2027 review", outcome: "", status: "upcoming" },
        ],
        growthSeries: consGrowth(),
      },
      {
        id: "c003", name: "Ruan Steenkamp", entityType: "individual",
        portfolioType: "model", modelPortfolio: "Aggressive portfolio",
        aum: 1.4, aumDisplay: "R1.4m", status: "on-track",
        adviser: "PM · Luyolo", goalLabel: "Wealth accumulation · 15 years",
        goalDate: "2041-01-01", targetReturn: 14.2, actualReturn: 15.1,
        phone: "+27 76 567 8901", email: "ruan.s@protonmail.com",
        since: "2022", lastContact: "2026-11-01",
        tags: ["high-growth", "long-horizon"],
        notes: "Young professional in fintech. High risk tolerance, long horizon. Expects aggressive growth. Happy to accept volatility. Added R200k this year as bonus investment.",
        meetings: [
          { id: "c003-m1", date: "2026-11-01", title: "Annual review", outcome: "Above target. Increased equity target to 75%.", status: "done" },
          { id: "c003-m2", date: "2027-05-01", title: "Mid-year check-in", outcome: "", status: "upcoming" },
        ],
        growthSeries: aggrGrowth(),
      },
      {
        id: "c004", name: "Priya Naidoo", entityType: "individual",
        portfolioType: "model", modelPortfolio: "Conservative portfolio",
        aum: 0.85, aumDisplay: "R850k", status: "below-target",
        adviser: "PM · Luyolo", goalLabel: "Retirement income · 5 years",
        goalDate: "2031-07-01", targetReturn: 9.2, actualReturn: 7.8,
        phone: "+27 71 678 9012", email: "priya.n@outlook.com",
        since: "2021", lastContact: "2026-09-15",
        tags: ["income", "review-needed"],
        notes: "Concerned about recent underperformance. Had a career interruption and reduced contributions for 18 months. Conservative mandate may need revisiting given 5-year horizon still provides some flexibility.",
        meetings: [
          { id: "c004-m1", date: "2026-09-15", title: "Review — performance discussion", outcome: "Noted underperformance. Agreed to review mandate vs horizon.", status: "done" },
          { id: "c004-m2", date: "2026-12-10", title: "Mandate review meeting", outcome: "", status: "upcoming" },
        ],
        growthSeries: consGrowth(-2.5),
      },
      {
        id: "c005", name: "Sipho Mthembu", entityType: "individual",
        portfolioType: "model", modelPortfolio: "Moderate portfolio",
        aum: 3.2, aumDisplay: "R3.2m", status: "on-track",
        adviser: "PM · Luyolo", goalLabel: "Education + retirement · 2 goals",
        goalDate: "2036-01-01", targetReturn: 11.2, actualReturn: 11.6,
        phone: "+27 82 789 0123", email: "sipho.m@gmail.com",
        since: "2018", lastContact: "2026-10-30",
        tags: ["dual-goal", "moderate"],
        notes: "Split goals: funding children's university education (2030) and his own retirement (2040). Moderate blend serves both. Recently added an endowment product for the education sleeve.",
        meetings: [
          { id: "c005-m1", date: "2026-10-30", title: "Annual review", outcome: "On track for both goals. Reviewed endowment performance.", status: "done" },
          { id: "c005-m2", date: "2027-04-15", title: "Education goal check", outcome: "", status: "upcoming" },
        ],
        growthSeries: modGrowth(0.5),
      },
      {
        id: "c006", name: "Nomsa Zulu", entityType: "individual",
        portfolioType: "model", modelPortfolio: "Aggressive portfolio",
        aum: 5.1, aumDisplay: "R5.1m", status: "on-track",
        adviser: "PM · Luyolo", goalLabel: "Early retirement · age 55",
        goalDate: "2039-04-01", targetReturn: 14.2, actualReturn: 14.8,
        phone: "+27 83 890 1234", email: "nomsa.z@work.co.za",
        since: "2016", lastContact: "2026-11-05",
        tags: ["high-growth", "FIRE"],
        notes: "Targeting financial independence by 55. Highest risk appetite in the book. Very engaged client, monitors performance weekly. Has a secondary property portfolio outside this mandate.",
        meetings: [
          { id: "c006-m1", date: "2026-11-05", title: "Quarterly review", outcome: "Ahead of target. Discussed increasing EM allocation.", status: "done" },
          { id: "c006-m2", date: "2027-02-01", title: "Q1 2027 planning", outcome: "", status: "upcoming" },
        ],
        growthSeries: aggrGrowth(1),
      },
      {
        id: "c007", name: "Nkosi Family Trust", entityType: "trust",
        portfolioType: "model", modelPortfolio: "Moderate portfolio",
        aum: 28, aumDisplay: "R28m", status: "on-track",
        adviser: "PM · Luyolo", goalLabel: "Multi-generational wealth",
        goalDate: "2045-01-01", targetReturn: 11.2, actualReturn: 11.9,
        phone: "+27 11 234 5678", email: "admin@nkositrust.co.za",
        since: "2014", lastContact: "2026-10-18",
        tags: ["trust", "multi-gen", "large"],
        notes: "Established family trust with 3 beneficiaries. Trustees meet quarterly. Governance-sensitive — requires formal meeting records and annual trustee reporting. Long-horizon, moderate risk.",
        meetings: [
          { id: "c007-m1", date: "2026-10-18", title: "Trustee quarterly meeting", outcome: "Reviewed performance. Approved Nov committee report.", status: "done" },
          { id: "c007-m2", date: "2026-07-14", title: "Trustee meeting Q3", outcome: "Discussed succession planning horizon.", status: "done" },
          { id: "c007-m3", date: "2027-01-20", title: "Annual trustee review", outcome: "", status: "upcoming" },
        ],
        growthSeries: modGrowth(2),
      },
      {
        id: "c008", name: "Blue Horizon Pension Fund", entityType: "institution",
        portfolioType: "model", modelPortfolio: "Moderate portfolio",
        aum: 65, aumDisplay: "R65m", status: "at-risk",
        adviser: "PM · Luyolo", goalLabel: "Liability matching · pension",
        goalDate: "2030-12-01", targetReturn: 11.2, actualReturn: 10.1,
        phone: "+27 21 345 6789", email: "cio@bluehorizonpension.co.za",
        since: "2019", lastContact: "2026-11-12",
        tags: ["pension", "institution", "liability"],
        notes: "Pension fund with 180 active members. Board oversight is rigorous. Currently 1.1pp below liability-matching target — driven by global equity drag. At-risk flag raised. CIO meeting scheduled Dec.",
        meetings: [
          { id: "c008-m1", date: "2026-11-12", title: "Quarterly board presentation", outcome: "Performance shortfall noted. Mandate review proposed.", status: "done" },
          { id: "c008-m2", date: "2026-08-20", title: "Q3 board meeting", outcome: "Reaffirmed current mandate pending Q4 review.", status: "done" },
          { id: "c008-m3", date: "2026-12-05", title: "CIO mandate review", outcome: "", status: "upcoming" },
        ],
        growthSeries: modGrowth(-2),
      },

      /* ── BESPOKE CLIENTS ────────────────────────────────── */
      {
        id: "c009", name: "Mtunzi Family Office", entityType: "trust",
        portfolioType: "bespoke",
        allocations: [
          { fundId: "northstar",  fundName: "Northstar Global Equity",         assetClass: "Global Equity",        weight: 20 },
          { fundId: "protea",     fundName: "Protea SA Equity",                assetClass: "SA Equity",            weight: 18 },
          { fundId: "atlas",      fundName: "Atlas EM Equity",                 assetClass: "EM Equity",            weight: 10 },
          { fundId: "cedar",      fundName: "Cedar Infrastructure",            assetClass: "SA Infrastructure",    weight: 15 },
          { fundId: "tidal",      fundName: "Tidal Global Infrastructure",     assetClass: "Global Infrastructure",weight: 12 },
          { fundId: "umzi",       fundName: "Umzi Fixed Income",               assetClass: "SA Bonds",             weight: 10 },
          { fundId: "alpine",     fundName: "Alpine SA Inflation-Linked Bonds",assetClass: "SA ILBs",             weight:  8 },
          { fundId: "harness",    fundName: "Harness SA Cash",                 assetClass: "Cash",                 weight:  7 },
        ],
        aum: 85, aumDisplay: "R85m", status: "on-track",
        adviser: "PM · Luyolo", goalLabel: "Real asset growth + income",
        goalDate: "2040-01-01", targetReturn: 12.5, actualReturn: 13.1,
        phone: "+27 11 456 7890", email: "cfo@mtunzifo.co.za",
        since: "2015", lastContact: "2026-11-08",
        tags: ["family-office", "infrastructure", "bespoke", "large"],
        notes: "Single-family office with significant exposure to infrastructure and real assets. Philanthropic mandate embedded — requires ESG reporting. CIO is very hands-on, monthly calls standard.",
        meetings: [
          { id: "c009-m1", date: "2026-11-08", title: "Monthly CIO call", outcome: "Reviewed infra allocation. Requested Tidal fund due diligence.", status: "done" },
          { id: "c009-m2", date: "2026-10-10", title: "Quarterly review", outcome: "ESG reporting signed off. Infrastructure overweight reaffirmed.", status: "done" },
          { id: "c009-m3", date: "2026-12-08", title: "December CIO call", outcome: "", status: "upcoming" },
        ],
        growthSeries: bespokeGrowth([0, 1.0, 1.8, 2.9, 2.2, 3.5, 5.0, 6.2, 7.0, 7.9, 8.8, 9.9]),
      },
      {
        id: "c010", name: "Sanlam Staff Pension Fund", entityType: "institution",
        portfolioType: "bespoke",
        allocations: [
          { fundId: "sa-bond-index", fundName: "SA Bond Index",                     assetClass: "SA Bonds",      weight: 30 },
          { fundId: "umzi",          fundName: "Umzi Fixed Income",                  assetClass: "SA Bonds",      weight: 20 },
          { fundId: "spring",        fundName: "Spring SA Bonds",                    assetClass: "SA Bonds",      weight: 10 },
          { fundId: "alpine",        fundName: "Alpine SA Inflation-Linked Bonds",   assetClass: "SA ILBs",      weight: 15 },
          { fundId: "ridge",         fundName: "Ridge Global Bonds",                 assetClass: "Global Bonds",  weight:  8 },
          { fundId: "zenith",        fundName: "Zenith Global Bonds",                assetClass: "Global Bonds",  weight:  7 },
          { fundId: "harness",       fundName: "Harness SA Cash",                    assetClass: "Cash",          weight:  5 },
          { fundId: "global-index",  fundName: "Global Equity Index",                assetClass: "Global Equity", weight:  5 },
        ],
        aum: 250, aumDisplay: "R250m", status: "at-risk",
        adviser: "PM · Luyolo", goalLabel: "Liability matching · defined benefit",
        goalDate: "2035-01-01", targetReturn: 10.5, actualReturn: 9.2,
        phone: "+27 21 947 1234", email: "pension.cio@sanlam.co.za",
        since: "2012", lastContact: "2026-11-14",
        tags: ["pension", "institution", "liability", "bespoke", "large"],
        notes: "Largest mandate on the book. Liability-driven approach required by actuary. Currently 1.3pp below target driven by global bond drag. Actuary review due Q1 2027. Governance board meets bi-monthly.",
        meetings: [
          { id: "c010-m1", date: "2026-11-14", title: "Bi-monthly governance board", outcome: "Performance shortfall tabled. Actuary report presented.", status: "done" },
          { id: "c010-m2", date: "2026-09-10", title: "Q3 governance meeting", outcome: "Duration review approved. Bond allocation maintained.", status: "done" },
          { id: "c010-m3", date: "2027-01-14", title: "Q1 2027 actuary review", outcome: "", status: "upcoming" },
        ],
        growthSeries: bespokeGrowth([0, 0.4, 0.7, 1.2, 1.0, 1.5, 2.0, 2.4, 2.8, 3.3, 3.8, 4.5]),
      },
      {
        id: "c011", name: "Protea Wellness Endowment", entityType: "institution",
        portfolioType: "bespoke",
        allocations: [
          { fundId: "global-index", fundName: "Global Equity Index",                 assetClass: "Global Equity", weight: 25 },
          { fundId: "northstar",    fundName: "Northstar Global Equity",              assetClass: "Global Equity", weight: 15 },
          { fundId: "protea",       fundName: "Protea SA Equity",                     assetClass: "SA Equity",     weight: 20 },
          { fundId: "meridian",     fundName: "Meridian SA Multi-Asset",              assetClass: "Multi-Asset",   weight:  8 },
          { fundId: "moss",         fundName: "Moss SA Multi-Asset",                  assetClass: "Multi-Asset",   weight: 10 },
          { fundId: "umzi",         fundName: "Umzi Fixed Income",                    assetClass: "SA Bonds",      weight: 12 },
          { fundId: "alpine",       fundName: "Alpine SA Inflation-Linked Bonds",     assetClass: "SA ILBs",      weight:  5 },
          { fundId: "cedar",        fundName: "Cedar Infrastructure",                 assetClass: "SA Infrastructure",weight:5 },
        ],
        aum: 28, aumDisplay: "R28m", status: "on-track",
        adviser: "PM · Luyolo", goalLabel: "Endowment growth · ESG mandate",
        goalDate: "2038-01-01", targetReturn: 11.0, actualReturn: 11.3,
        phone: "+27 21 876 5432", email: "finance@proteawellness.org",
        since: "2020", lastContact: "2026-10-25",
        tags: ["endowment", "ESG", "institution", "bespoke"],
        notes: "Non-profit wellness organisation. Strict ESG screening required across all holdings. Excludes tobacco, weapons, fossil-fuel extraction. Annual impact report required. Very engaged board.",
        meetings: [
          { id: "c011-m1", date: "2026-10-25", title: "Annual impact review", outcome: "ESG scores satisfactory. Meridian allocation increased.", status: "done" },
          { id: "c011-m2", date: "2026-07-20", title: "Mid-year check-in", outcome: "No changes. Reaffirmed ESG mandate compliance.", status: "done" },
          { id: "c011-m3", date: "2027-04-25", title: "Annual impact review 2027", outcome: "", status: "upcoming" },
        ],
        growthSeries: bespokeGrowth([0, 0.9, 1.5, 2.4, 1.8, 3.0, 4.1, 5.0, 5.7, 6.4, 7.2, 8.1]),
      },
      {
        id: "c012", name: "Ubuntu Capital Partners", entityType: "institution",
        portfolioType: "bespoke",
        allocations: [
          { fundId: "northstar",  fundName: "Northstar Global Equity",         assetClass: "Global Equity", weight: 20 },
          { fundId: "atlas",      fundName: "Atlas EM Equity",                 assetClass: "EM Equity",     weight: 20 },
          { fundId: "kalahari",   fundName: "Kalahari EM Small Cap",           assetClass: "EM Equity",     weight: 10 },
          { fundId: "protea",     fundName: "Protea SA Equity",                assetClass: "SA Equity",     weight: 20 },
          { fundId: "dune",       fundName: "Dune Global Multi-Asset",         assetClass: "Multi-Asset",   weight: 10 },
          { fundId: "moss",       fundName: "Moss SA Multi-Asset",             assetClass: "Multi-Asset",   weight: 10 },
          { fundId: "umzi",       fundName: "Umzi Fixed Income",               assetClass: "SA Bonds",      weight:  7 },
          { fundId: "harness",    fundName: "Harness SA Cash",                 assetClass: "Cash",          weight:  3 },
        ],
        aum: 45, aumDisplay: "R45m", status: "on-track",
        adviser: "PM · Luyolo", goalLabel: "High-growth · EM-tilt",
        goalDate: "2033-06-01", targetReturn: 13.5, actualReturn: 13.9,
        phone: "+27 11 567 8901", email: "cio@ubuntucapital.co.za",
        since: "2018", lastContact: "2026-11-03",
        tags: ["growth", "EM-focus", "institution", "bespoke"],
        notes: "Growth-oriented investment company with a deliberate emerging markets tilt. CIO has strong EM views. Looking to increase Kalahari allocation pending next review. Comfortable with higher volatility.",
        meetings: [
          { id: "c012-m1", date: "2026-11-03", title: "Quarterly strategy review", outcome: "EM overweight reaffirmed. Kalahari increase proposed.", status: "done" },
          { id: "c012-m2", date: "2026-08-01", title: "Q3 review", outcome: "Added Kalahari 5% pilot allocation.", status: "done" },
          { id: "c012-m3", date: "2027-02-03", title: "Q1 2027 strategy review", outcome: "", status: "upcoming" },
        ],
        growthSeries: bespokeGrowth([0, 1.1, 2.0, 3.2, 2.4, 4.1, 5.8, 7.0, 7.9, 8.8, 9.8, 10.8]),
      },
      {
        id: "c013", name: "Horizon Discovery Trust", entityType: "trust",
        portfolioType: "bespoke",
        allocations: [
          { fundId: "global-index", fundName: "Global Equity Index",              assetClass: "Global Equity", weight: 18 },
          { fundId: "northstar",    fundName: "Northstar Global Equity",          assetClass: "Global Equity", weight: 10 },
          { fundId: "protea",       fundName: "Protea SA Equity",                 assetClass: "SA Equity",     weight: 15 },
          { fundId: "sa-bond-index",fundName: "SA Bond Index",                   assetClass: "SA Bonds",      weight: 20 },
          { fundId: "umzi",         fundName: "Umzi Fixed Income",                assetClass: "SA Bonds",      weight: 10 },
          { fundId: "crest",        fundName: "Crest Conservative Multi-Asset",  assetClass: "Multi-Asset",   weight: 15 },
          { fundId: "harness",      fundName: "Harness SA Cash",                  assetClass: "Cash",          weight:  8 },
          { fundId: "baobab",       fundName: "Baobab SA Property",               assetClass: "SA Property",   weight:  4 },
        ],
        aum: 18, aumDisplay: "R18m", status: "below-target",
        adviser: "PM · Luyolo", goalLabel: "Balanced growth · beneficiary income",
        goalDate: "2032-01-01", targetReturn: 10.8, actualReturn: 9.6,
        phone: "+27 31 678 9012", email: "trustee@horizondiscovery.co.za",
        since: "2021", lastContact: "2026-10-05",
        tags: ["trust", "balanced", "bespoke"],
        notes: "Discretionary trust with two adult beneficiaries. Balanced mandate with income distribution requirement. Property drag from Baobab has contributed to underperformance. Reviewing property allocation.",
        meetings: [
          { id: "c013-m1", date: "2026-10-05", title: "Annual trustee meeting", outcome: "Underperformance discussed. Baobab review agreed.", status: "done" },
          { id: "c013-m2", date: "2026-06-10", title: "Mid-year beneficiary review", outcome: "Income distribution confirmed. No structural changes.", status: "done" },
          { id: "c013-m3", date: "2027-01-15", title: "Baobab review meeting", outcome: "", status: "upcoming" },
        ],
        growthSeries: bespokeGrowth([0, 0.5, 0.9, 1.6, 1.2, 2.0, 2.8, 3.4, 3.9, 4.5, 5.1, 5.8]),
      },
    ],
    _meta: { source: "CRM", asOf: "25 Nov 09:00", simulated: true },
  };
}
