import { useEffect, useState } from "react";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import SourceBadge from "../common/source-badge/SourceBadge";
import { getAlphaBetaData, type AlphaBetaData, type Quartile } from "../../connectors/alphaBeta";
import { getPerformanceData, type PerformanceData } from "../../connectors/performanceSystem";
import { getOutlookMeetings, type OutlookData } from "../../connectors/outlook";
import { useApp } from "../../context/AppContext";
import { calendarEvents } from "../../data";
import {
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, ReferenceLine
} from "recharts";
import "./research.css";

const TABS = [
  { id: "screening", label: "Screening" },
  { id: "profile",   label: "Manager profile" },
  { id: "meetprep",  label: "Meeting prep" },
];

const QUARTERS = ["Q4 23","Q1 24","Q2 24","Q3 24","Q4 24","Q1 25","Q2 25","Q3 25","Q4 25","Q1 26","Q2 26","Q3 26"];

export default function ResearchPage() {
  const tab = useActiveTab("research", "screening");
  const [ab, setAb] = useState<AlphaBetaData | null>(null);
  const [perf, setPerf] = useState<PerformanceData | null>(null);

  useEffect(() => { getAlphaBetaData().then(setAb); }, []);
  useEffect(() => { getPerformanceData().then(setPerf); }, []);

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Research</h1>
          <p className="page-heading-sub">Fund screening, manager profiles and meeting prep</p>
        </div>
      </div>
      <Tabs page="research" tabs={TABS} />
      {tab === "screening" && <ScreeningTab data={ab} />}
      {tab === "profile"   && <ManagerProfileTab perf={perf} ab={ab} />}
      {tab === "meetprep"  && <MeetingPrepTab perf={perf} ab={ab} />}
    </div>
  );
}

/* ─── SCREENING ─────────────────────────────────────────── */

const Q_COLORS: Record<Quartile, string> = {
  1: "#1A7D4A", 2: "#7EC8A0", 3: "#F5C26B", 4: "#C0303A"
};
const Q_BG: Record<Quartile, string> = {
  1: "#E6F5ED", 2: "#D0EDDF", 3: "#FEF3E2", 4: "#FDEAEA"
};

type AssetFilter = "All" | "SA Equity" | "Global Equity" | "SA Bonds" | "Multi-Asset" | "Other";
const ASSET_FILTERS: AssetFilter[] = ["All", "SA Equity", "Global Equity", "SA Bonds", "Multi-Asset", "Other"];
const STYLE_FILTERS = ["All", "Value", "Growth", "Quality Growth", "Passive", "Balanced"];

function ScreeningTab({ data }: { data: AlphaBetaData | null }) {
  const [assetFilter, setAssetFilter] = useState<string>("All");
  const [styleFilter, setStyleFilter] = useState<string>("All");

  if (!data) return <div className="prepare-placeholder">Loading…</div>;

  const filtered = data.funds.filter(f => {
    const assetOk = assetFilter === "All" ||
      f.assetClass === assetFilter ||
      (assetFilter === "Other" && !ASSET_FILTERS.slice(1, -1).includes(f.assetClass as AssetFilter));
    const styleOk = styleFilter === "All" || f.style === styleFilter;
    return assetOk && styleOk;
  });

  return (
    <div className="screen-layout">
      {/* Filters */}
      <div className="screen-filter-row">
        <div className="screen-filter-group">
          <span className="screen-filter-label">Asset class</span>
          <div className="screen-filter-pills">
            {ASSET_FILTERS.map(f => (
              <button key={f} className={`pill${assetFilter === f ? " active" : ""}`} onClick={() => setAssetFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className="screen-filter-group">
          <span className="screen-filter-label">Style</span>
          <div className="screen-filter-pills">
            {STYLE_FILTERS.map(f => (
              <button key={f} className={`pill${styleFilter === f ? " active" : ""}`} onClick={() => setStyleFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <SourceBadge meta={data._meta} />
      </div>

      {/* Heat map */}
      <div className="screen-heatmap-wrap card" style={{ padding: 0, overflow: "auto" }}>
        <table className="screen-heatmap">
          <thead>
            <tr>
              <th className="screen-fund-col">Fund</th>
              <th className="screen-meta-col">Asset class</th>
              <th className="screen-meta-col">Style</th>
              {QUARTERS.map(q => <th key={q} className="screen-q-col">{q}</th>)}
              <th className="screen-score-col">Consistency</th>
              <th className="screen-score-col">Persistency</th>
              <th className="screen-q-col">Current Q</th>
              <th className="screen-fee-col">Fee</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="screen-row">
                <td className="screen-fund-name">{f.name}</td>
                <td className="screen-meta-val">{f.assetClass}</td>
                <td className="screen-meta-val">{f.style}</td>
                {f.quarterlyQuartiles.map((q, i) => (
                  <td key={i} className="screen-q-cell" style={{ background: Q_BG[q], color: Q_COLORS[q] }}>
                    {q}
                  </td>
                ))}
                <td className="screen-score-cell">
                  <ScoreBar value={f.consistencyScore} />
                </td>
                <td className="screen-score-cell">
                  <ScoreBar value={f.persistencyScore} />
                </td>
                <td className="screen-q-cell" style={{ background: Q_BG[f.currentQuartile], color: Q_COLORS[f.currentQuartile], fontWeight: 700 }}>
                  Q{f.currentQuartile}
                </td>
                <td className="screen-fee-val">{f.fee.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="screen-legend">
        {([1,2,3,4] as Quartile[]).map(q => (
          <span key={q} className="screen-legend-item" style={{ background: Q_BG[q], color: Q_COLORS[q] }}>Q{q}</span>
        ))}
        <span className="screen-legend-text">— darker green = top quartile, red = bottom</span>
      </div>
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 75 ? "var(--positive)" : value >= 50 ? "var(--warning)" : "var(--negative)";
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="score-bar-label" style={{ color }}>{value}</span>
    </div>
  );
}

/* ─── MANAGER PROFILE ────────────────────────────────────── */

type Rating = "A" | "AA" | "AAA";

interface RatingEntry {
  rating: Rating;
  label: string;
  description: string;
}

interface ESGEntry {
  rating: Rating;
  label: string;
  e: Rating; s: Rating; g: Rating;
  note: string;
}

interface FundRatings {
  risk: RatingEntry;
  skill: RatingEntry;
  esg?: ESGEntry;
}

const FUND_RATINGS: Record<string, FundRatings> = {
  northstar: {
    risk:  { rating: "AAA", label: "High",     description: "Concentrated global large-cap equity with elevated US mega-cap exposure (38%). Currency risk unhedged. Style drift toward growth increases sensitivity to rate moves." },
    skill: { rating: "AA",  label: "Strong",   description: "Consistent top-quartile record over 5+ years. Disciplined sell discipline and low turnover indicate genuine stock-selection edge. Under active review following 2024 drift." },
    esg:   { rating: "AA",  label: "ESG Integrated", e: "AAA", s: "AA", g: "AAA", note: "ESG fully integrated into stock selection. Proprietary scoring framework. Excludes thermal coal and controversial weapons. Annual engagement report published." },
  },
  umzi: {
    risk:  { rating: "A",   label: "Low",      description: "Investment-grade SA government and high-grade bonds. Duration 6.2y vs 5.4y benchmark — above-average interest-rate sensitivity but credit quality remains high." },
    skill: { rating: "AA",  label: "Strong",   description: "Macro-driven duration calls have added consistent value through the cutting cycle. Monthly IC sign-off and transparent process. Highest consistency score in the SA bond peer group." },
  },
  protea: {
    risk:  { rating: "AA",  label: "Moderate", description: "SA equity mandate with value bias. Concentration in financials (28%) adds sector risk. Domestic exposure means sensitivity to rand and macro cycle." },
    skill: { rating: "A",   label: "Adequate", description: "Recent outperformance (+1.2pp) validates value approach. Shorter track record for lead PM (9 years) vs peers. Research lead confirmed Oct 2024 adds depth." },
  },
  "global-index": {
    risk:  { rating: "AA",  label: "Moderate", description: "Broad global equity index — concentration in US mega-cap tech (top 10 holdings ≈ 32% of fund). Currency unhedged. Passive mandate cannot reduce concentration risk." },
    skill: { rating: "A",   label: "Adequate", description: "Passive mandate — no active skill assessed. Tracking error consistently below 10bps. Provider operations and index governance are institutional grade." },
    esg:   { rating: "A",   label: "ESG Aware", e: "A", s: "A", g: "A", note: "No active ESG integration — index includes all MSCI World constituents. Some exclusion of extreme controversies via index provider rules." },
  },
  cedar: {
    risk:  { rating: "A",   label: "Low",      description: "SA infrastructure bonds and concession assets. Cash flows are contractual and inflation-linked. Illiquidity is priced in. Low correlation to listed equity." },
    skill: { rating: "AA",  label: "Strong",   description: "Consistent Q1 performance in the SA real assets peer group. Strong origination pipeline in energy infrastructure. Lead PM Thandi Molefe has 10 years in this asset class." },
    esg:   { rating: "AAA", label: "ESG Leader", e: "AAA", s: "AA", g: "AA", note: "Infrastructure mandate explicitly targets clean energy and social infrastructure. Full UNPRI signatory. Impact reporting includes CO₂ displaced by projects." },
  },
  baobab: {
    risk:  { rating: "AA",  label: "Moderate", description: "Listed SA property REIT exposure. Office and retail vacancy headwinds persist. Sector gearing of ~35% amplifies rate sensitivity. Income at risk from large tenant vacancies." },
    skill: { rating: "A",   label: "Adequate", description: "Recent underperformance (−2.6pp) reflects genuine sector headwinds, not process failure. Lead PM has navigated previous property downturns. Under watch pending sector recovery." },
  },
  atlas: {
    risk:  { rating: "AA",  label: "Moderate", description: "Broad EM equity exposure including China (38%), Korea (14%), Taiwan (12%). China regulatory and geopolitical risk elevated. Currency unhedged, adds EM FX volatility." },
    skill: { rating: "AA",  label: "Strong",   description: "Consistent Q2 record with periodic Q1 spikes. Strong research team across Asia and LATAM. Hiroshi Tanaka brings 14 years of EM experience. Well-regarded in peer community." },
    esg:   { rating: "AA",  label: "ESG Integrated", e: "AA", s: "A", g: "AA", note: "ESG integrated across EM holdings. China governance risk acknowledged and partially mitigated through sovereign bond exclusions. Engagement programme active in Korea and India." },
  },
  harness: {
    risk:  { rating: "A",   label: "Low",      description: "SA money market instruments only. No credit below investment grade. Maximum single-issuer limit 10%. Duration < 90 days. Capital at risk is minimal." },
    skill: { rating: "AA",  label: "Strong",   description: "Highest consistency and persistency scores on the cash screen. Consistent Q1 by selecting better-yielding CPs and CDs within the mandate. Competitive return vs repo." },
  },
  ridge: {
    risk:  { rating: "AA",  label: "Moderate", description: "Global developed market bonds. Duration 7.0y is above the benchmark. Fed holding higher-for-longer is a material headwind. Currency hedged to USD — partial protection." },
    skill: { rating: "A",   label: "Adequate", description: "Underperforming vs benchmark (−0.6pp) due to duration drag in a flat-yield environment. Process is sound but macro calls have not added value in the current cycle." },
  },
  falcon: {
    risk:  { rating: "AA",  label: "Moderate", description: "SA growth equity — high Naspers/Prosus concentration (14.8%) and growth-factor tilt. Vulnerable to rand weakness and momentum shifts. Currently in an extended underperformance cycle." },
    skill: { rating: "A",   label: "Adequate", description: "Persistent Q3–Q4 performance raises concerns about style relevance. Growth factor underperformance in SA is partly exogenous, but sector concentration is a process choice. Under active review." },
  },
  moss: {
    risk:  { rating: "A",   label: "Low",      description: "Diversified SA multi-asset mandate with low equity concentration. 60/40-style balance with domestic bias. Rand and SA macro cycle are the primary risk factors." },
    skill: { rating: "AA",  label: "Strong",   description: "Consistent Q2 with Q1 spikes. Well-balanced allocation process. Lead PM Lungile Nkosi has 9 years of multi-asset experience. Tactical tilts have added modest value." },
  },
  dune: {
    risk:  { rating: "AA",  label: "Moderate", description: "Global multi-asset with concentrated tactical tilts. Currency mix (USD/EUR/ZAR) adds FX risk. Tactical allocation can deviate materially from benchmark positioning." },
    skill: { rating: "AAA", label: "Exceptional", description: "Best consistency score in the global multi-asset peer group. Aysha Patel's tactical calls on duration and equity have added 1.8pp over the past year. Clear process edge." },
    esg:   { rating: "AA",  label: "ESG Integrated", e: "AA", s: "AA", g: "AAA", note: "ESG integrated at the asset-class and security level. Carbon footprint target below peer benchmark. Full UNPRI signatory with annual disclosure." },
  },
  spring: {
    risk:  { rating: "A",   label: "Low",      description: "Passive SA bond index (AllBond). Investment-grade SA government bonds only. Duration tracks the benchmark at 5.4y. Credit and concentration risk minimal." },
    skill: { rating: "A",   label: "Adequate", description: "Passive mandate — no active skill assessed. Tracking error consistently below 5bps. Provider operational controls are robust. Very competitive fee (0.15%)." },
  },
  peak: {
    risk:  { rating: "AA",  label: "Moderate", description: "Market-cap weighted US equity (S&P 500). Very high tech sector concentration (30%+). Mega-cap 7 stocks >28% of fund. USD currency risk unhedged." },
    skill: { rating: "A",   label: "Adequate", description: "Near-passive — replicates the S&P 500 at a competitive fee. Tracking error below 5bps. Skill is in operational efficiency, not active selection." },
  },
  clay: {
    risk:  { rating: "AAA", label: "High",     description: "Highly concentrated in deep-value SA resources and cyclicals. Commodities exposure (coal, gold, iron ore) brings operational and commodity price volatility. Underperformance cycle extended." },
    skill: { rating: "A",   label: "Adequate", description: "Currently Q4 and persistently underperforming the ALSI by −8.2pp. Deep value is a valid style but requires a catalyst. Mandate review is overdue. Lead PM credibility under pressure." },
  },
  alpine: {
    risk:  { rating: "A",   label: "Low",      description: "SA inflation-linked government bonds only. CPI-linked coupons provide real return protection. Duration 7.8y is long — rate sensitivity, but hedged against inflation surprise." },
    skill: { rating: "AA",  label: "Strong",   description: "Consistent Q1 in SA ILBs. Sarah Mthembu brings 8 years of experience in this niche market. Outperforming (0.8pp) through careful real-yield duration management." },
  },
  tidal: {
    risk:  { rating: "A",   label: "Low",      description: "Listed global infrastructure equity — energy transition, utilities, transport. Cash flows are regulated or contractual. Lower beta than listed equity. FX unhedged adds some currency risk." },
    skill: { rating: "AA",  label: "Strong",   description: "Q1 track record since inception. Marco Rossi's energy transition focus has benefited from thematic tailwinds. 1.0pp above benchmark over 1Y. Strong pipeline awareness." },
    esg:   { rating: "AAA", label: "ESG Leader", e: "AAA", s: "AA", g: "AA", note: "Infrastructure mandate explicitly aligned to UN SDG 7 (clean energy) and 9 (industry/innovation). Minimum 60% of fund in energy transition or sustainable infrastructure assets." },
  },
  meridian: {
    risk:  { rating: "A",   label: "Low",      description: "Diversified SA multi-asset with a tactical overlay. Domestic bias limits FX risk. Mandate has an equity ceiling of 65% that provides downside protection." },
    skill: { rating: "AA",  label: "Strong",   description: "Consistent Q2 with Q1 periods. Tactical allocation calls by Zola Khumalo have added incremental value. Well-regarded in the ASISA MA High Equity peer group." },
  },
  crest: {
    risk:  { rating: "A",   label: "Low",      description: "Capital preservation mandate — equity maximum 30%. Primarily SA bonds, cash and ILBs. Very low drawdown history. Suitable for near-retirees and conservative mandates." },
    skill: { rating: "AAA", label: "Exceptional", description: "Highest consistency score in the SA MA Low Equity peer group. Liezel Bosman's conservative positioning has consistently outperformed through market cycles. Strongly recommended for defensive mandates." },
  },
  zenith: {
    risk:  { rating: "AA",  label: "Moderate", description: "Active global bond fund with duration 7.5y — above benchmark. Exposure to peripheral European debt (Italy, Spain) adds spread risk. Fed policy is a primary headwind." },
    skill: { rating: "A",   label: "Adequate", description: "Currently underperforming (−0.6pp). Brendan Walsh's duration calls have not added value in the current cycle. Process is well-documented but macro calls need recalibration." },
  },
  kalahari: {
    risk:  { rating: "AAA", label: "High",     description: "EM small cap — highest volatility and liquidity risk in the universe. Concentration in China, Korea and India tech small caps. Policy and FX risk elevated. Only suitable as a satellite allocation." },
    skill: { rating: "AA",  label: "Strong",   description: "Outperforming (0.3pp) in a difficult EM environment. Amir Hassan's stock-picking in Korean and Indian small caps has been the key driver. Track record is building — 3 years since inception." },
  },
};

const FUND_QUAL: Record<string, {
  philosophy: string; team: string; process: string;
  strengths: string[]; concerns: string[];
  lastInterview: string; whyWeHold: string; houseViewLink: string;
}> = {
  northstar: {
    philosophy: "Quality-growth investing in global large caps, targeting companies with durable competitive advantages and high returns on invested capital.",
    team: "Lead PM James Olivier (18 years). Two analysts added in 2023. No senior departures since 2022.",
    process: "Bottom-up stock selection, ESG-integrated, 30–50 holdings, low turnover (~20% p.a.).",
    strengths: ["Consistent long-term track record (pre-2024)", "Disciplined sell discipline", "Strong ESG integration"],
    concerns: ["Recent US mega-cap concentration", "Style drift toward larger market cap", "Q3–Q4 2024 performance lag"],
    lastInterview: "26 Sep 2026 — team discussed rising US concentration. PM acknowledged drift and indicated repositioning in Q4.",
    whyWeHold: "Provides quality-growth global equity exposure not easily replicated with passive. Under active review.",
    houseViewLink: "Global Equity (view: −1 — expensive, concentration risk)",
  },
  umzi: {
    philosophy: "Active duration management in SA government and high-grade bonds, exploiting yield-curve mispricing.",
    team: "Lead PM Thabo Dlamini (12 years). Team of 3 analysts stable since 2021.",
    process: "Macro-driven duration calls, credit quality focus, monthly IC sign-off on duration positions.",
    strengths: ["Consistent Q1 performance", "Transparent process", "Very competitive fee"],
    concerns: ["Duration 6.2y vs 5.4y benchmark — above-average interest-rate risk"],
    lastInterview: "14 Nov 2026 — reviewed duration positioning. PM confident in cutting cycle thesis.",
    whyWeHold: "Core SA bond exposure. Active duration is adding value and justified by cutting cycle house view.",
    houseViewLink: "SA Bonds (view: +2 — strong overweight, cutting cycle)",
  },
  protea: {
    philosophy: "Value-oriented SA equity investing, focusing on under-priced domestic companies with improving fundamentals.",
    team: "Lead PM Nomvula Khumalo (9 years). Research lead confirmed October 2024.",
    process: "Fundamental bottom-up with a macro overlay. 25–35 holdings, medium turnover.",
    strengths: ["Strong recent outperformance (+1.2pp)", "Genuine value bias in portfolio", "Stable team"],
    concerns: ["Concentration in financials (28%)", "Value style can lag in momentum markets"],
    lastInterview: "09 Oct 2026 — solid review. No concerns raised. Next review February 2027.",
    whyWeHold: "Provides differentiated value exposure to SA equities. Ahead of benchmark and within mandate.",
    houseViewLink: "SA Equity (view: +1 — overweight, cheap on PE)",
  },
  "global-index": {
    philosophy: "Full replication of the MSCI World Index, providing low-cost broad global equity exposure for core portfolio sleeves.",
    team: "Index-tracking mandate — no active investment team. Administered by Global Index Partners.",
    process: "Passive full replication. Rebalanced quarterly following MSCI index reviews. Tracking error target below 10bps.",
    strengths: ["Lowest fee in the global equity peer group (0.20%)", "Highly liquid", "Transparent and predictable"],
    concerns: ["No ability to manage concentration risk", "US tech weighting above 30%", "Cannot deviate from index on ESG grounds"],
    lastInterview: "20 Mar 2026 — operational review only. No concerns raised.",
    whyWeHold: "Cost-efficient broad global equity exposure. Used as a complement to active mandates in the portfolio.",
    houseViewLink: "Global Equity (view: −1 — expensive, concentration risk)",
  },
  cedar: {
    philosophy: "Direct and listed SA infrastructure investments targeting inflation-linked real returns from contractual cash flows.",
    team: "Lead PM Thandi Molefe (10 years in infrastructure). Team of 2 analysts. Stable since 2020.",
    process: "Bottom-up project selection, cash-flow modelling, real return targeting. IC approval required for new positions.",
    strengths: ["Inflation-linked cash flows provide portfolio hedging", "Consistent Q1 in SA real assets", "Strong origination pipeline in energy infrastructure"],
    concerns: ["Illiquid underlying assets — exit timing can be constrained", "Sovereign and regulatory risk on infrastructure projects"],
    lastInterview: "04 Nov 2026 — energy infrastructure focus discussed. PM confident on power sector pipeline.",
    whyWeHold: "Provides inflation-linked real return exposure. Directly aligned to house view on SA infrastructure (+1 overweight).",
    houseViewLink: "Infrastructure (view: +1 — overweight, electricity build-out theme)",
  },
  baobab: {
    philosophy: "Core listed SA REIT exposure, targeting income yield and capital growth through diversified property ownership.",
    team: "Lead PM Johan van Wyk (8 years in SA listed property). Two analysts. Research lead new in 2025.",
    process: "Bottom-up REIT selection, NAV analysis, vacancy and lease-maturity monitoring. Conservative gearing limit.",
    strengths: ["Experienced team with cycle knowledge", "Diversified across retail, office and industrial", "Yield above peer average"],
    concerns: ["Office and retail vacancy headwinds persist", "Sector gearing amplifies rate sensitivity", "Recent persistent underperformance (−2.6pp)"],
    lastInterview: "18 Oct 2026 — vacancy trends discussed. PM expects gradual recovery through 2027. Office remains a headwind.",
    whyWeHold: "Provides listed property exposure for income-oriented mandates. Under review — waiting for sector catalyst.",
    houseViewLink: "SA Property (view: −1 — slight underweight, structural vacancies)",
  },
  atlas: {
    philosophy: "Active EM equity investing across Asia, LATAM and EMEA, exploiting inefficiencies in under-researched emerging markets.",
    team: "Lead PM Hiroshi Tanaka (14 years in EM). Regional analysts in Hong Kong, Mumbai and Johannesburg. Team stable since 2022.",
    process: "Bottom-up stock selection with country and sector overlays. 40–60 holdings. Governance screen applied to all holdings.",
    strengths: ["Deep regional research capability", "Strong governance screening", "Consistent Q2 with Q1 periods"],
    concerns: ["China regulatory and geopolitical risk elevated (38% of fund)", "Currency volatility in EM FX", "Recent slight underperformance (−0.6pp)"],
    lastInterview: "22 Oct 2026 — China positioning discussed. PM reducing from 38% to 32% over Q4. India and ASEAN being increased.",
    whyWeHold: "Core EM equity exposure with differentiated research. Neutral house view — holding at current weight.",
    houseViewLink: "EM Equity (view: 0 — neutral, China uncertainty offsets EM value)",
  },
  harness: {
    philosophy: "Active cash management targeting yield above repo rate by selecting better-yielding money-market instruments within a strict credit framework.",
    team: "Lead PM Nkosi Dlamini (7 years in cash management). Single-analyst support. Mandate has very low complexity.",
    process: "Credit limits by issuer (max 10%), duration < 90 days, investment-grade only. Daily rate monitoring and rolling.",
    strengths: ["Consistently Q1 in cash peer group", "Very competitive fee (0.18%)", "High liquidity and credit quality"],
    concerns: ["As repo rate declines, yield compression reduces relative attractiveness", "Limited alpha potential in cash mandates"],
    lastInterview: "12 Nov 2026 — repo rate outlook discussed. PM transitioning shorter as cutting cycle accelerates.",
    whyWeHold: "Provides highly liquid, low-risk return above repo. Used for cash management and mandate liquidity buffers.",
    houseViewLink: "SA Cash (view: 0 — neutral, trim on rate cuts)",
  },
  ridge: {
    philosophy: "Active duration management in global developed-market bonds, focusing on G7 sovereign yield curves.",
    team: "Lead PM Céline Dupont (11 years in global bonds). Team of 2 analysts in London and New York. Stable since 2022.",
    process: "Macro-driven duration, country allocation and curve positioning. Currency hedged to USD baseline. Monthly IC review.",
    strengths: ["Experienced global macro perspective", "Well-documented process", "Competitive fee vs active global bond peers"],
    concerns: ["Duration 7.0y above benchmark — headwind in flat-yield environment", "Fed trajectory risk remains elevated", "Recent underperformance (−0.6pp)"],
    lastInterview: "28 Oct 2026 — Fed trajectory discussed. PM expects one more cut in 2027; duration will come down gradually.",
    whyWeHold: "Provides active global bond exposure. Currently underperforming due to macro headwinds. House view: underweight.",
    houseViewLink: "Global Bonds (view: −1 — underweight, duration risk elevated)",
  },
  falcon: {
    philosophy: "Growth-oriented SA equity, targeting domestic consumer, technology and financial companies with strong earnings momentum.",
    team: "Lead PM Greg Botha (12 years). Two analysts. No senior departures but junior analyst turnover above peers.",
    process: "Momentum and earnings-driven stock selection. 20–30 concentrated holdings. High sector concentration allowed.",
    strengths: ["Clear growth philosophy", "Competitive fee", "Experienced lead PM"],
    concerns: ["Persistent Q3–Q4 performance (−5.8pp excess this year)", "Naspers/Prosus concentration (14.8%) is a single risk", "Growth factor out of favour in current market"],
    lastInterview: "15 Oct 2026 — performance discussed. PM acknowledges Naspers drag and expects Prosus discount to narrow. No process changes planned.",
    whyWeHold: "Provides growth-factor SA equity exposure. Currently on watch — underperformance extended. Review scheduled Q1 2027.",
    houseViewLink: "SA Equity (view: +1 — overweight, but growth factor headwind noted)",
  },
  moss: {
    philosophy: "Balanced SA multi-asset, blending equity, bonds and alternatives to deliver consistent CPI+ returns across cycles.",
    team: "Lead PM Lungile Nkosi (9 years in multi-asset). Team of 3 analysts. Stable team, senior analyst promoted in 2025.",
    process: "Strategic allocation with tactical tilts approved by monthly IC. 60/40 baseline. Full look-through on underlying holdings.",
    strengths: ["Consistent Q2 with Q1 periods", "Well-balanced allocation process", "Strong IC governance structure"],
    concerns: ["Domestic-biased — limited offshore diversification", "Tactical tilts have added only modest value vs strategic benchmark"],
    lastInterview: "05 Nov 2026 — quarterly review. No concerns raised. IC governance process praised.",
    whyWeHold: "Core SA balanced exposure for client mandates that require a single-manager solution. Within mandate and meeting return targets.",
    houseViewLink: "SA Equity (view: +1) and SA Bonds (view: +2)",
  },
  dune: {
    philosophy: "Tactical global multi-asset, dynamically allocating across global equities, bonds, alternatives and currencies based on macro regime analysis.",
    team: "Lead PM Aysha Patel (15 years in global multi-asset). Three analysts. Former Goldman Sachs macro desk experience.",
    process: "Top-down macro regime assessment, tactical allocation approved by weekly IC, full derivative overlay capability.",
    strengths: ["Highest consistency score in global MA peer group", "Strong tactical calls in 2025–2026", "Derivative capability for downside protection"],
    concerns: ["High fee (1.10%) requires sustained outperformance to justify", "Tactical approach can lead to whipsaw in ranging markets"],
    lastInterview: "10 Nov 2026 — Q4 positioning discussed. PM bullish on global infrastructure; reducing DM equity concentration.",
    whyWeHold: "Exceptional tactical alpha. Best-in-class global multi-asset for mandates requiring active FX and cross-asset allocation.",
    houseViewLink: "Global Infrastructure (view: +1) and DM Equity (view: −1)",
  },
  spring: {
    philosophy: "Full replication of the South African AllBond Index, providing low-cost, broad SA bond market exposure.",
    team: "Index-tracking mandate — administered by Spring Index Solutions. No active investment team.",
    process: "Full replication of AllBond Index. Rebalanced monthly. Tracking error target below 5bps.",
    strengths: ["Lowest fee in the SA bond peer group (0.15%)", "Fully transparent", "Very high liquidity"],
    concerns: ["No ability to manage duration or credit quality actively", "Full exposure to SA sovereign risk"],
    lastInterview: "15 Jan 2026 — operational review only. No issues raised.",
    whyWeHold: "Cost-efficient SA bond exposure. Used as a passive complement to active duration mandates.",
    houseViewLink: "SA Bonds (view: +2 — strong overweight, cutting cycle)",
  },
  peak: {
    philosophy: "Market-cap weighted US equity index (S&P 500), providing core exposure to the largest and most liquid US-listed companies.",
    team: "Index-tracking mandate — administered by Peak Capital USA. No active investment team.",
    process: "Passive market-cap replication of the S&P 500. Rebalanced quarterly. Dividends reinvested.",
    strengths: ["Very competitive fee (0.25%)", "Highest 1Y return in the global equity peer group", "Very liquid"],
    concerns: ["Very high tech concentration (>30%)", "USD only — full currency risk unhedged", "No ESG active management"],
    lastInterview: "20 Apr 2026 — operational review only. No concerns raised.",
    whyWeHold: "Provides efficient US large-cap equity exposure at a low cost. Complements MSCI World broad mandate.",
    houseViewLink: "Global Equity (view: −1 — expensive, US concentration risk)",
  },
  clay: {
    philosophy: "Deep-value SA equity, targeting unloved and mispriced companies in resources, industrials and cyclicals with mean-reversion potential.",
    team: "Lead PM Pieter du Plessis (16 years, value specialist). Two analysts. No team changes in 3 years.",
    process: "Contrarian, bottom-up value selection. Price-to-book and EV/EBITDA driven. 15–25 highly concentrated holdings.",
    strengths: ["Experienced deep-value practitioner", "Potential to outperform strongly when value catalyst arrives", "Cheap fee relative to active peers"],
    concerns: ["Currently Q4, −8.2pp excess this year", "Deep-value catalyst remains absent", "Commodity price dependency very high (Sasol, Anglo Gold, Sibanye)"],
    lastInterview: "08 Oct 2026 — difficult conversation. PM maintains thesis but acknowledges extended period without catalyst. Mandate review proposed by PM team.",
    whyWeHold: "Tactical position for mandates that allow contrarian exposure. No new allocations. Mandate review scheduled Q1 2027.",
    houseViewLink: "SA Equity (view: +1 — but growth factor preferred over deep value currently)",
  },
  alpine: {
    philosophy: "Active management of SA inflation-linked bonds (ILBs), targeting real return above CPI through duration and real-yield positioning.",
    team: "Lead PM Sarah Mthembu (8 years in SA ILBs). One analyst. Specialised niche mandate.",
    process: "Active real-yield duration management. CPI breakeven monitoring. IC-approved duration tilts within ±1 year of benchmark.",
    strengths: ["Consistent Q1 in SA ILB peer group", "Strong real-yield management", "Natural CPI hedge for liability-matching mandates"],
    concerns: ["CPI falling toward target reduces real-return opportunity", "Illiquid market — daily liquidity constrained for large mandates"],
    lastInterview: "17 Nov 2026 — real yield positioning discussed. PM expects CPI to remain near lower band; real yield duration being extended.",
    whyWeHold: "Provides inflation-linked real return. Important hedging role for pension and endowment mandates with CPI-linked liabilities.",
    houseViewLink: "SA ILBs (view: 0 → +1 — neutral now, upgrade likely on disinflation)",
  },
  tidal: {
    philosophy: "Active global infrastructure equity, targeting listed companies in energy transition, utilities, transport and social infrastructure.",
    team: "Lead PM Marco Rossi (13 years in global infrastructure). Three analysts across London, New York and Singapore.",
    process: "Bottom-up infrastructure equity selection, regulatory and cash-flow analysis. ESG and energy-transition scoring applied to all holdings.",
    strengths: ["Q1 track record since inception", "Energy transition thematic exposure well-positioned", "Best-in-class ESG for infrastructure mandates"],
    concerns: ["Higher fee (1.05%) vs listed equity peers", "Regulatory risk in some European utilities", "FX unhedged — USD/EUR/GBP currency mix"],
    lastInterview: "01 Nov 2026 — energy transition pipeline discussed. PM adding NextEra and Vinci as European grid investment accelerates.",
    whyWeHold: "Inflation-linked cash flows, energy transition exposure and global diversification. Directly aligned to house view.",
    houseViewLink: "Global Infrastructure (view: +1 — overweight, long-dated real rates falling)",
  },
  meridian: {
    philosophy: "Tactical SA multi-asset, using active allocation between SA equity, bonds and property to generate consistent CPI+4% real returns.",
    team: "Lead PM Zola Khumalo (11 years in multi-asset). Team of 2 analysts. Stable since 2021.",
    process: "Strategic allocation baseline with IC-approved tactical tilts (up to ±10pp from benchmark). Monthly IC review.",
    strengths: ["Well-regarded in ASISA MA High Equity peer group", "Tactical calls have added incremental value", "Transparent governance"],
    concerns: ["Domestic bias limits offshore diversification", "MA High Equity peer group is competitive"],
    lastInterview: "13 Nov 2026 — Q3 tactical review. SA equity overweight reaffirmed. Property allocation trimmed post-Baobab review.",
    whyWeHold: "Core SA multi-asset for balanced mandates. Consistent performance with low fee and strong governance.",
    houseViewLink: "SA Equity (view: +1) and SA Bonds (view: +2)",
  },
  crest: {
    philosophy: "Capital preservation with modest real growth, targeting CPI+2% by prioritising bonds, cash and ILBs with limited equity exposure.",
    team: "Lead PM Liezel Bosman (9 years in capital preservation strategies). Two analysts. Very stable team.",
    process: "Conservative SAA — equity ceiling 30%. Downside scenario testing each quarter. IC approval required for any equity tilt.",
    strengths: ["Highest consistency score in SA MA Low Equity peer group", "Exceptional capital preservation through past drawdowns", "Very competitive fee"],
    concerns: ["CPI+2% target is modest — may underperform in strong equity markets", "Limited equity upside capture"],
    lastInterview: "29 Oct 2026 — conservative mandate reaffirmed. No structural changes. PM flagged CPI declining as a potential headwind for ILB allocation.",
    whyWeHold: "Best-in-class capital preservation. Recommended for conservative client mandates and near-retirement accounts.",
    houseViewLink: "SA Bonds (view: +2) and SA Cash (view: 0)",
  },
  zenith: {
    philosophy: "Active global bond management targeting consistent income and real return through G7 duration and credit allocation.",
    team: "Lead PM Brendan Walsh (12 years in global fixed income). Two analysts in London. Former Bank of Ireland asset management.",
    process: "Macro-driven duration with country and credit spread allocation. Monthly IC review. Currency hedged to USD baseline.",
    strengths: ["Experienced global macro perspective", "Well-documented process", "Diversified country exposure vs peers"],
    concerns: ["Currently underperforming (−0.6pp)", "Duration 7.5y above benchmark — vulnerable to yield moves", "Fed trajectory uncertainty"],
    lastInterview: "21 Oct 2026 — duration risk discussed. PM acknowledges Fed uncertainty but maintains conviction. Expects duration to add value in H1 2027.",
    whyWeHold: "Provides active global bond exposure as a complement to passive Ridge mandate. Under review given underperformance.",
    houseViewLink: "Global Bonds (view: −1 — underweight, duration risk elevated)",
  },
  kalahari: {
    philosophy: "Active EM small-cap equity investing, targeting inefficiently priced small and mid-cap companies in key emerging markets.",
    team: "Lead PM Amir Hassan (10 years in EM small cap). Two analysts covering Asia and MENA. Founded firm in 2021.",
    process: "Fundamental bottom-up stock selection, 50–80 holdings. Country limits applied. Liquidity minimum enforced per holding.",
    strengths: ["Outperforming in difficult EM environment (0.3pp excess)", "Strong stock-picking in Korean and Indian small cap", "Niche exposure not easily replicated"],
    concerns: ["Relatively short 3-year track record", "High fee (1.30%) requires sustained outperformance", "Liquidity risk in small caps during market stress"],
    lastInterview: "06 Nov 2026 — first formal review meeting. PM confident on India SMID cap thesis and Korean battery supply chain.",
    whyWeHold: "Provides differentiated EM small-cap return stream. Pilot allocation for bespoke mandates — monitoring for 12 months before full recommendation.",
    houseViewLink: "EM Equity (view: 0 — neutral, monitoring for upgrade)",
  },
};

function riskColor(r: Rating) {
  return r === "AAA" ? "var(--negative)" : r === "AA" ? "var(--warning)" : "var(--positive)";
}
function skillColor(r: Rating) {
  return r === "AAA" ? "var(--positive)" : r === "AA" ? "var(--brand-accent)" : "var(--warning)";
}
function esgColor(r: Rating) {
  return r === "AAA" ? "var(--positive)" : r === "AA" ? "var(--brand-accent)" : "var(--text-muted)";
}

function RatingsTab({ selectedId }: { selectedId: string }) {
  const { state } = useApp();
  const base = FUND_RATINGS[selectedId];
  if (!base) return <div className="prepare-placeholder">No ratings available for this fund.</div>;
  const overrides = state.fundRatingOverrides[selectedId] ?? {};
  // Merge overrides from interview notes into standing ratings
  const ratings = {
    ...base,
    risk:  overrides.risk  ? { ...base.risk,  rating: overrides.risk  } : base.risk,
    skill: overrides.skill ? { ...base.skill, rating: overrides.skill } : base.skill,
    esg:   base.esg && overrides.esg ? { ...base.esg, rating: overrides.esg } : base.esg,
  };

  const rc = riskColor(ratings.risk.rating);
  const sc = skillColor(ratings.skill.rating);

  return (
    <div className="ratings-layout">
      {/* Risk rating */}
      <div className="card rating-card">
        <div className="rating-card-header">
          <div>
            <div className="rating-type-label">Risk Rating</div>
            <div className="rating-label" style={{ color: rc }}>{ratings.risk.label}</div>
          </div>
          <div className="rating-score-num" style={{ color: rc }}>{ratings.risk.rating}</div>
        </div>
        <p className="rating-desc">{ratings.risk.description}</p>
        <div className="rating-scale-legend">
          <span style={{ color: "var(--positive)" }}>A Low</span>
          <span className="rating-scale-sep">→</span>
          <span style={{ color: "var(--warning)" }}>AA Moderate</span>
          <span className="rating-scale-sep">→</span>
          <span style={{ color: "var(--negative)" }}>AAA High</span>
        </div>
      </div>

      {/* Skill rating */}
      <div className="card rating-card">
        <div className="rating-card-header">
          <div>
            <div className="rating-type-label">Skill Rating</div>
            <div className="rating-label" style={{ color: sc }}>{ratings.skill.label}</div>
          </div>
          <div className="rating-score-num" style={{ color: sc }}>{ratings.skill.rating}</div>
        </div>
        <p className="rating-desc">{ratings.skill.description}</p>
        <div className="rating-scale-legend">
          <span style={{ color: "var(--warning)" }}>A Adequate</span>
          <span className="rating-scale-sep">→</span>
          <span style={{ color: "var(--brand-accent)" }}>AA Strong</span>
          <span className="rating-scale-sep">→</span>
          <span style={{ color: "var(--positive)" }}>AAA Exceptional</span>
        </div>
      </div>

      {/* ESG rating — only if present */}
      {ratings.esg && (
        <div className="card rating-card rating-card-esg">
          <div className="rating-card-header">
            <div>
              <div className="rating-type-label">ESG Rating</div>
              <div className="rating-label" style={{ color: esgColor(ratings.esg.rating) }}>{ratings.esg.label}</div>
            </div>
            <div className="rating-score-num" style={{ color: esgColor(ratings.esg.rating) }}>{ratings.esg.rating}</div>
          </div>
          <div className="esg-pillars">
            {([["E", ratings.esg.e, "Environmental"], ["S", ratings.esg.s, "Social"], ["G", ratings.esg.g, "Governance"]] as const).map(([, val, fullLabel]) => (
              <div key={fullLabel} className="esg-pillar">
                <div className="esg-pillar-label">{fullLabel}</div>
                <div className="esg-pillar-score" style={{ color: esgColor(val) }}>{val}</div>
              </div>
            ))}
          </div>
          <p className="rating-desc" style={{ marginTop: 12 }}>{ratings.esg.note}</p>
        </div>
      )}

      {!ratings.esg && (
        <div className="card rating-card rating-card-esg-na">
          <div className="rating-type-label">ESG Rating</div>
          <div className="rating-esg-na">Not assessed — ESG rating not available for this fund.</div>
        </div>
      )}
    </div>
  );
}

function ManagerProfileTab({ perf, ab }: { perf: PerformanceData | null; ab: AlphaBetaData | null }) {
  const { state, dispatch } = useApp();
  const funds = ab?.funds ?? [];
  const selectedId = state.selectedFundId || "northstar";
  const [profileTab, setProfileTab] = useState<"overview" | "ratings">("overview");
  const [outlook, setOutlook] = useState<OutlookData | null>(null);
  useEffect(() => { getOutlookMeetings().then(setOutlook); }, []);
  const fundRow = funds.find(f => f.id === selectedId);
  const fund = fundRow ? {
    id: fundRow.id,
    name: fundRow.name,
    role: `${fundRow.assetClass} · ${fundRow.style}`,
    fee: `${fundRow.fee.toFixed(2)}%`,
    rating: `Q${fundRow.currentQuartile}`,
  } : null;
  const fundPerf = perf?.funds[selectedId];
  const qual = FUND_QUAL[selectedId];

  return (
    <div className="profile-layout">
      {/* Inner sub-tabs */}
      <div className="profile-inner-tabs">
        <button className={`profile-inner-tab${profileTab === "overview" ? " active" : ""}`} onClick={() => setProfileTab("overview")}>Overview</button>
        <button className={`profile-inner-tab${profileTab === "ratings" ? " active" : ""}`} onClick={() => setProfileTab("ratings")}>Ratings</button>
      </div>

      {/* Fund selector */}
      {funds.length > 0 && (
        <div className="research-fund-selector">
          <span className="research-fund-label">Fund</span>
          <select
            className="research-fund-select"
            value={selectedId}
            onChange={e => dispatch({ type: "SET_SELECTED_FUND", id: e.target.value })}
          >
            {funds.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {fundRow && (
            <span className="research-fund-meta">
              {fundRow.assetClass} · {fundRow.style} · Q{fundRow.currentQuartile} · {fundRow.fee.toFixed(2)}%
            </span>
          )}
        </div>
      )}

      {/* Ratings tab */}
      {profileTab === "ratings" && <RatingsTab selectedId={selectedId} />}

      {/* Overview tab */}
      {profileTab === "overview" && fund && fundPerf && qual && (
        <div className="profile-body">
          {/* Left: quantitative */}
          <div className="profile-quant">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{fund.name}</div>
                  <div className="card-subtitle">{fund.role}</div>
                </div>
                {perf && <SourceBadge meta={perf._meta} />}
              </div>
              <div className="profile-stat-grid">
                {[
                  ["1M return",   `${fundPerf.return1M >= 0 ? "+" : ""}${fundPerf.return1M}%`, fundPerf.return1M >= 0 ? "text-positive" : "text-negative"],
                  ["3M return",   `${fundPerf.return3M >= 0 ? "+" : ""}${fundPerf.return3M}%`, fundPerf.return3M >= 0 ? "text-positive" : "text-negative"],
                  ["1Y return",   `${fundPerf.return1Y}%`, ""],
                  ["1Y benchmark",`${fundPerf.benchmarkReturn1Y}%`, "text-muted"],
                  ["1Y excess",   `${fundPerf.excessReturn1Y >= 0 ? "+" : ""}${fundPerf.excessReturn1Y}pp`, fundPerf.excessReturn1Y >= 0 ? "text-positive" : "text-negative"],
                  ["3Y return",   `${fundPerf.return3Y}%`, ""],
                  ["Fee",         fund.fee, ""],
                  ["Rating",      fund.rating, ""],
                ].map(([label, value, cls]) => (
                  <div key={label} className="profile-stat-item">
                    <div className="profile-stat-label">{label}</div>
                    <div className={`profile-stat-value ${cls}`}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quartile history */}
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-header"><span className="card-title">Quartile history</span></div>
              <div className="profile-quartile-row">
                {fundPerf.quartileHistory.map((q, i) => (
                  <div key={i} className="profile-q-cell" style={{ background: Q_BG[q.quartile as Quartile], color: Q_COLORS[q.quartile as Quartile] }}>
                    <div className="profile-q-label">{q.quarter}</div>
                    <div className="profile-q-val">Q{q.quartile}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top holdings */}
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-header"><span className="card-title">Top holdings</span></div>
              {fundPerf.topHoldings.map(h => (
                <div key={h.name} className="profile-holding-row">
                  <span>{h.name}</span>
                  <span className="profile-holding-weight">{h.weight}%</span>
                </div>
              ))}
            </div>

            {/* Style drift */}
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-header"><span className="card-title">Style drift (Value ← 0 → Growth)</span></div>
              <ResponsiveContainer width="100%" height={120}>
                <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid stroke="var(--border)" />
                  <XAxis dataKey="value" name="Value/Growth score" tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickFormatter={v => `${v}`} />
                  <YAxis dataKey="growth" name="Growth score" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <ReferenceLine x={0} stroke="var(--border-mid)" />
                  <Scatter data={fundPerf.styleDrift.map(d => ({ value: d.value, growth: d.growth, date: d.date }))} fill="var(--brand-accent)" />
                  <Tooltip formatter={(v) => `${v}`} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: qualitative */}
          <div className="profile-qual">
            <div className="card">
              <div className="card-header"><span className="card-title">Philosophy</span></div>
              <p className="profile-qual-text">{qual.philosophy}</p>
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-header"><span className="card-title">Team</span></div>
              <p className="profile-qual-text">{qual.team}</p>
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-header"><span className="card-title">Process</span></div>
              <p className="profile-qual-text">{qual.process}</p>
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-header"><span className="card-title">Strengths</span></div>
              <ul className="profile-list positive">
                {qual.strengths.map(s => <li key={s}>{s}</li>)}
              </ul>
              <div className="card-title" style={{ marginTop: 10 }}>Concerns</div>
              <ul className="profile-list negative">
                {qual.concerns.map(c => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-header"><span className="card-title">Last interview</span></div>
              <p className="profile-qual-text">{qual.lastInterview}</p>
            </div>
            <div className="card profile-why-card" style={{ marginTop: 12 }}>
              <div className="card-header"><span className="card-title">Why we hold this manager</span></div>
              <p className="profile-qual-text">{qual.whyWeHold}</p>
              <div className="profile-hv-link">
                <span className="profile-hv-icon">↗</span>
                <button className="profile-hv-btn" onClick={() => dispatch({ type: "SET_SECTION_AND_TAB", id: "prepare", tab: "taa" })}>
                  {qual.houseViewLink}
                </button>
              </div>
            </div>

            {/* Meetings & notes */}
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-header">
                <span className="card-title">Meetings &amp; notes</span>
                <button className="profile-hv-btn" onClick={() => dispatch({ type: "SET_SECTION_AND_TAB", id: "calendar", tab: "meetings" })}>
                  View all →
                </button>
              </div>
              {/* Next meeting */}
              {(() => {
                const next = outlook?.meetings.find(m => m.linkedManagerId === selectedId);
                return next ? (
                  <div className="profile-meeting-row">
                    <span className="profile-meeting-label">Next meeting</span>
                    <div className="profile-meeting-info">
                      <span className="profile-meeting-title">{next.title}</span>
                      <span className="profile-meeting-date">{next.start.slice(0, 10)} {next.start.slice(11, 16)}</span>
                    </div>
                    <button className="btn-outline" style={{ padding: "4px 10px", fontSize: 11 }}
                      onClick={() => dispatch({ type: "OPEN_PREP_PACK", meetingId: next.id })}>
                      Prep pack
                    </button>
                  </div>
                ) : <p className="profile-qual-text" style={{ color: "var(--text-muted)" }}>No upcoming meetings.</p>;
              })()}
              {/* Interview notes */}
              {state.interviewNotes.filter(n => n.fundId === selectedId).slice(0, 2).map(n => (
                <div key={n.id} className="profile-note-row">
                  <span className="profile-note-date">{n.date}</span>
                  <span className="profile-note-scores">T:{n.teamScore} P:{n.processScore} Ph:{n.philosophyScore}</span>
                  <span className="profile-note-excerpt">{n.concerns || n.process || "Interview note"}</span>
                </div>
              ))}
              {state.interviewNotes.filter(n => n.fundId === selectedId).length === 0 && (
                <p className="profile-qual-text" style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 12 }}>
                  No interview notes yet.{" "}
                  <button className="profile-hv-btn" onClick={() => dispatch({ type: "SET_SECTION_AND_TAB", id: "calendar", tab: "notes" })}>
                    Add one →
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MEETING PREP ───────────────────────────────────────── */

type PrepQuestion = { id: string; text: string; source: "ai" | "pm"; checked: boolean };

interface FundPrepData {
  perfMetrics: Array<[string, string, "positive" | "negative" | "neutral"]>;
  changes: string[];
  questions: PrepQuestion[];
  actions: Array<{ text: string; done: boolean }>;
}

const FUND_PREP: Record<string, FundPrepData> = {
  northstar: {
    perfMetrics: [
      ["1M excess", "−1.8pp", "negative"], ["3M excess", "+2.1pp", "positive"],
      ["1Y excess", "−2.1pp", "negative"], ["Latest quartile", "Q2", "neutral"],
    ],
    changes: [
      "US mega-cap concentration increased from 32% to 38% of the portfolio.",
      "Style drift identified — value/growth score moved from 0.72 to 0.84 (more growth-biased).",
      "Short-term performance recovered in Q3 (+2.1pp over 3 months) after a weak H1.",
      "No team changes confirmed since the October check.",
    ],
    questions: [
      { id: "q1", text: "What drove the increase in US mega-cap concentration in Q3–Q4?", source: "ai", checked: false },
      { id: "q2", text: "Has the team taken any action to reduce the style drift identified in October?", source: "ai", checked: false },
      { id: "q3", text: "What is the outlook for the quality-growth factor in a higher-for-longer rate environment?", source: "ai", checked: false },
      { id: "q4", text: "How do you think about position sizing for Nvidia at >6% of the fund?", source: "pm", checked: true },
      { id: "q5", text: "Any team changes planned for 2027?", source: "pm", checked: true },
    ],
    actions: [
      { text: "Northstar to provide attribution for US mega-cap concentration by 15 Dec", done: false },
      { text: "PM to review style drift against mandate tolerance", done: false },
      { text: "Fee schedule confirmed at 1.00% — no changes", done: true },
    ],
  },
  umzi: {
    perfMetrics: [
      ["1M excess", "+0.4pp", "positive"], ["3M excess", "+1.2pp", "positive"],
      ["1Y excess", "+1.5pp", "positive"], ["Latest quartile", "Q1", "positive"],
    ],
    changes: [
      "Duration extended slightly from 6.1y to 6.2y following the November rate cut.",
      "Portfolio yield increased marginally to 10.9% as new bonds were added at higher yields.",
      "No credit quality changes — all holdings remain investment grade.",
    ],
    questions: [
      { id: "q1", text: "How are you positioning duration given the expected pace of further repo cuts?", source: "ai", checked: false },
      { id: "q2", text: "Any credit allocation changes planned as spreads compress?", source: "ai", checked: false },
      { id: "q3", text: "What is your view on the yield curve shape over the next 6 months?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Confirm December IC view on SA bond duration", done: false },
      { text: "Review fee competitiveness vs peers for renewal", done: true },
    ],
  },
  protea: {
    perfMetrics: [
      ["1M excess", "+0.8pp", "positive"], ["3M excess", "+1.2pp", "positive"],
      ["1Y excess", "+1.2pp", "positive"], ["Latest quartile", "Q1", "positive"],
    ],
    changes: [
      "Financials concentration increased from 26% to 28% — approaching mandate limit.",
      "New research lead (confirmed Oct 2024) has begun contributing to stock selection.",
      "Outperformance maintained despite rand volatility in October.",
    ],
    questions: [
      { id: "q1", text: "With financials at 28%, how close are you to the mandate ceiling?", source: "ai", checked: false },
      { id: "q2", text: "How has the new research lead influenced the investment process so far?", source: "ai", checked: false },
      { id: "q3", text: "What is your view on domestic consumer recovery feeding into your holdings?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Clarify financials concentration limit in mandate documentation", done: false },
      { text: "Schedule 6-month review with new research lead", done: false },
    ],
  },
  "global-index": {
    perfMetrics: [
      ["1M return",  "+1.9%",  "positive"], ["3M return",  "+5.4%",  "positive"],
      ["1Y return",  "+18.2%", "positive"], ["Tracking err", "<10bps", "positive"],
    ],
    changes: [
      "MSCI World rebalance in September added 12 new constituents, mostly in Japanese tech.",
      "US tech weighting increased to 31.4% after Nvidia's market-cap surge.",
      "No fee or provider changes. Provider confirmed operational review completed.",
    ],
    questions: [
      { id: "q1", text: "What was the net impact of the September MSCI rebalance on the fund?", source: "ai", checked: false },
      { id: "q2", text: "How is the fund managing the growing Nvidia and mega-cap concentration?", source: "ai", checked: false },
      { id: "q3", text: "Any changes to the ESG exclusions overlay planned?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Confirm rebalance schedule for Q4 2026 MSCI review", done: false },
      { text: "Fee confirmed at 0.20% — no change", done: true },
    ],
  },
  cedar: {
    perfMetrics: [
      ["1M excess", "+0.3pp", "positive"], ["3M excess", "+0.9pp", "positive"],
      ["1Y excess", "+1.1pp", "positive"], ["Latest quartile", "Q1", "positive"],
    ],
    changes: [
      "New energy infrastructure project (solar generation, 180MW) added to pipeline in October.",
      "Contracted revenue from existing assets increased by 4.2% following CPI escalation.",
      "One concession near end of term — PM team actively reviewing reinvestment options.",
    ],
    questions: [
      { id: "q1", text: "What is the timeline for the new solar project to generate returns?", source: "ai", checked: false },
      { id: "q2", text: "How are you managing the reinvestment risk from the expiring concession?", source: "ai", checked: false },
      { id: "q3", text: "What is the split of infrastructure spend between energy and social infrastructure?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Cedar to provide update on solar project due diligence by 20 Jan 2027", done: false },
      { text: "Review concession expiry impact on CPI-linked return target", done: false },
      { text: "ESG impact report reviewed and filed — Q3 2026", done: true },
    ],
  },
  baobab: {
    perfMetrics: [
      ["1M excess", "−0.9pp", "negative"], ["3M excess", "−1.4pp", "negative"],
      ["1Y excess", "−2.6pp", "negative"], ["Latest quartile", "Q3", "neutral"],
    ],
    changes: [
      "Office vacancy increased marginally to 14.2% — above peer average of 12.1%.",
      "Retail portfolio vacancy stable at 6.8%. Industrial vacancy at 3.1% (strong).",
      "New research lead joined in Q2 2025 — first full year review pending.",
      "Sector gearing declined to 32% from 35% — partial de-risking.",
    ],
    questions: [
      { id: "q1", text: "What is your strategy to reduce the office vacancy below the peer average?", source: "ai", checked: false },
      { id: "q2", text: "Has the new research lead changed the team's approach to stock selection?", source: "ai", checked: false },
      { id: "q3", text: "At what vacancy rate does the income yield start to look impaired?", source: "pm", checked: false },
      { id: "q4", text: "Is there a case for increasing the industrial/logistics weighting given strong vacancy?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Baobab to provide office tenant pipeline and lease renewal schedule", done: false },
      { text: "Confirm mandate review date — sector underperformance extended", done: false },
    ],
  },
  atlas: {
    perfMetrics: [
      ["1M excess", "+0.2pp", "positive"], ["3M excess", "−0.3pp", "negative"],
      ["1Y excess", "−0.6pp", "negative"], ["Latest quartile", "Q2", "neutral"],
    ],
    changes: [
      "China allocation being reduced from 38% to 32% — PM confirmed in October meeting.",
      "India allocation increased to 18% as PM sees better risk-adjusted returns vs China.",
      "New position in ASEAN fintech sector (5% of fund) initiated in Q3.",
      "Governance screen flagged one Korean holding — under review.",
    ],
    questions: [
      { id: "q1", text: "How quickly will the China reduction be executed and what's the target weight?", source: "ai", checked: false },
      { id: "q2", text: "What is your thesis on ASEAN fintech — is this a new allocation or thematic extension?", source: "ai", checked: false },
      { id: "q3", text: "Which Korean holding was flagged by governance screen and what is the resolution?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Atlas to confirm timeline for China reduction to 32%", done: false },
      { text: "Review governance screen outcome on Korean holding by next meeting", done: false },
      { text: "India thesis confirmed — monitoring for 6 months", done: true },
    ],
  },
  harness: {
    perfMetrics: [
      ["Repo spread", "+0.42pp", "positive"], ["3M return", "+2.6%", "positive"],
      ["1Y return", "+10.8%", "positive"], ["Latest quartile", "Q1", "positive"],
    ],
    changes: [
      "Portfolio average yield declined from 11.2% to 10.9% as the repo rate cut through.",
      "Issuer mix adjusted — increased commercial paper with 60-day tenor to extend yield slightly.",
      "No credit events. All issuers remain investment grade.",
    ],
    questions: [
      { id: "q1", text: "How much of the yield compression is structural vs a temporary lag from the rate cut?", source: "ai", checked: false },
      { id: "q2", text: "Are you considering any changes to the duration ceiling given the flatter yield curve?", source: "ai", checked: false },
      { id: "q3", text: "How do you see the mandate evolving if repo falls below 7.5%?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Harness to provide updated issuer concentration report for December IC", done: false },
      { text: "Fee review — confirm 0.18% rate for 2027 mandate renewal", done: false },
    ],
  },
  ridge: {
    perfMetrics: [
      ["1M excess", "−0.2pp", "negative"], ["3M excess", "−0.4pp", "negative"],
      ["1Y excess", "−0.6pp", "negative"], ["Latest quartile", "Q2", "neutral"],
    ],
    changes: [
      "Duration remains elevated at 7.0y — PM expects to trim in Q1 2027 if Fed signals pause.",
      "German Bund allocation increased to 22% — PM sees safe-haven value.",
      "UK Gilts trimmed after Budget uncertainty in October.",
    ],
    questions: [
      { id: "q1", text: "When exactly do you plan to reduce duration and what will trigger that move?", source: "ai", checked: false },
      { id: "q2", text: "How has the increase in German Bunds performed relative to expectations?", source: "ai", checked: false },
      { id: "q3", text: "Given continued underperformance, what gives you confidence the duration thesis will work?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Ridge to provide scenario analysis — duration at 5.5y vs 7.0y under two rate paths", done: false },
      { text: "Underperformance watch note filed — next IC review February 2027", done: true },
    ],
  },
  falcon: {
    perfMetrics: [
      ["1M excess", "−1.3pp", "negative"], ["3M excess", "−2.9pp", "negative"],
      ["1Y excess", "−5.8pp", "negative"], ["Latest quartile", "Q3", "neutral"],
    ],
    changes: [
      "Naspers/Prosus combined at 14.8% of fund — discount has not narrowed as expected.",
      "Growth factor underperformance extended — now 18 months below benchmark.",
      "No portfolio changes in Q3 — PM maintains thesis on consumer tech recovery.",
      "Junior analyst departed in September. Replacement search underway.",
    ],
    questions: [
      { id: "q1", text: "At what point do you change your view on the Naspers discount narrowing?", source: "ai", checked: false },
      { id: "q2", text: "With 18 months of underperformance, what has changed in your conviction?", source: "ai", checked: false },
      { id: "q3", text: "How will you manage the analyst vacancy during a period of elevated portfolio risk?", source: "pm", checked: false },
      { id: "q4", text: "Has any part of the growth thesis proven correct — where has the fund added value?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Formal watch letter issued to Falcon — mandate review Q1 2027", done: true },
      { text: "Falcon to provide timeline for analyst replacement", done: false },
      { text: "Naspers/Prosus concentration limit discussion at next IC", done: false },
    ],
  },
  moss: {
    perfMetrics: [
      ["1M excess", "+0.3pp", "positive"], ["3M excess", "+0.6pp", "positive"],
      ["1Y excess", "+0.9pp", "positive"], ["Latest quartile", "Q2", "positive"],
    ],
    changes: [
      "SA equity allocation increased to 55% from 52% following October IC tilt decision.",
      "SA bond duration slightly extended in line with cutting cycle conviction.",
      "New alternatives sleeve (5%) added in Q3 — private credit allocation.",
      "IC governance process updated — tilt decisions now require two-thirds majority.",
    ],
    questions: [
      { id: "q1", text: "How is the new private credit alternative sleeve performing and what is the liquidity profile?", source: "ai", checked: false },
      { id: "q2", text: "How has the two-thirds majority IC rule changed the speed of tactical decisions?", source: "ai", checked: false },
      { id: "q3", text: "With domestic bias at ~65%, how do you think about offshore diversification limits?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Moss to provide attribution for 1Y outperformance by asset class", done: false },
      { text: "Review private credit sleeve liquidity terms before next IC", done: false },
      { text: "Fee review confirmed at 0.75% — in line with peer median", done: true },
    ],
  },
  dune: {
    perfMetrics: [
      ["1M excess", "+0.6pp", "positive"], ["3M excess", "+1.9pp", "positive"],
      ["1Y excess", "+2.4pp", "positive"], ["Latest quartile", "Q1", "positive"],
    ],
    changes: [
      "Global infrastructure allocation increased to 18% — PM sees inflation-linked real return opportunity.",
      "DM equity allocation reduced from 32% to 26% — de-risking ahead of Fed pivot.",
      "Derivative overlay hedged 40% of USD exposure in October.",
      "New macro analyst from Goldman Sachs joined the team in September.",
    ],
    questions: [
      { id: "q1", text: "With 18% in global infrastructure, is there a ceiling for this allocation?", source: "ai", checked: false },
      { id: "q2", text: "How has the derivative overlay been contributing to and costing returns?", source: "ai", checked: false },
      { id: "q3", text: "What does the new macro analyst bring that the team previously lacked?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Dune to provide overlay cost attribution and net contribution to returns", done: false },
      { text: "Review fee justification — 1.10% requires sustained Q1 performance", done: false },
      { text: "Infrastructure allocation upper limit reviewed and confirmed at 20%", done: true },
    ],
  },
  spring: {
    perfMetrics: [
      ["1M return",  "+0.9%",  "positive"], ["3M return",  "+2.8%",  "positive"],
      ["1Y return",  "+11.4%", "positive"], ["Tracking err", "<5bps", "positive"],
    ],
    changes: [
      "AllBond Index rebalanced in October — minor duration extension to 5.5y from 5.4y.",
      "No fee or provider changes. Provider tracking error confirmed below 5bps.",
      "Coupon reinvestment efficiency improved — lag reduced from 2 to 1 trading day.",
    ],
    questions: [
      { id: "q1", text: "What is the impact of the October AllBond rebalance on the fund's yield and duration?", source: "ai", checked: false },
      { id: "q2", text: "Any upcoming index methodology changes that might affect the fund?", source: "ai", checked: false },
    ],
    actions: [
      { text: "Confirm AllBond index schedule for Q1 2027 rebalance", done: false },
      { text: "Fee confirmed at 0.15% — lowest in peer group", done: true },
    ],
  },
  peak: {
    perfMetrics: [
      ["1M return",  "+2.1%",  "positive"], ["3M return",  "+6.8%",  "positive"],
      ["1Y return",  "+24.6%", "positive"], ["Tracking err", "<5bps", "positive"],
    ],
    changes: [
      "Nvidia added to S&P 500 at 3.8% weighting after joining the index in Q3.",
      "Healthcare sector weighting declined after index re-classification of several biotech firms.",
      "USD strengthened vs ZAR — contributed to ZAR-denominated return above USD return.",
    ],
    questions: [
      { id: "q1", text: "With Nvidia at 3.8% and rising, what is the index's total mega-cap concentration now?", source: "ai", checked: false },
      { id: "q2", text: "How has the USD strengthening contributed to ZAR returns over the last quarter?", source: "ai", checked: false },
    ],
    actions: [
      { text: "Confirm S&P 500 constituent changes for Q4 2026 rebalance", done: false },
      { text: "Currency hedging policy reviewed — no change. Unhedged mandate confirmed", done: true },
    ],
  },
  clay: {
    perfMetrics: [
      ["1M excess", "−2.1pp", "negative"], ["3M excess", "−3.8pp", "negative"],
      ["1Y excess", "−8.2pp", "negative"], ["Latest quartile", "Q4", "negative"],
    ],
    changes: [
      "Commodity exposure (gold, iron ore) dragged returns as commodity cycle worsened.",
      "Sasol dropped a further 12% — now at 9.8% of fund (above target weight of 8%).",
      "PM team proposed a mandate review in October — board decision pending.",
      "No team changes but lead PM credibility is under internal scrutiny.",
    ],
    questions: [
      { id: "q1", text: "What is the specific catalyst you are waiting for and what is your time horizon?", source: "ai", checked: false },
      { id: "q2", text: "Given 8.2pp underperformance, can you articulate what has gone right versus wrong?", source: "ai", checked: false },
      { id: "q3", text: "What would you change about the portfolio today if you were constructing it fresh?", source: "pm", checked: false },
      { id: "q4", text: "Is Pieter du Plessis still the right PM for this mandate going into 2027?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Formal mandate review at IC — January 2027. Clay to attend", done: false },
      { text: "No new allocations to Clay until review completed", done: true },
      { text: "Sasol position to be discussed — concentration limit breach review", done: false },
    ],
  },
  alpine: {
    perfMetrics: [
      ["1M excess", "+0.3pp", "positive"], ["3M excess", "+0.5pp", "positive"],
      ["1Y excess", "+0.8pp", "positive"], ["Latest quartile", "Q1", "positive"],
    ],
    changes: [
      "Real yield duration extended to 8.1y — PM repositioning ahead of potential CPI undershoot.",
      "CPI linked bonds rolling in Q1 2027 — reinvestment yield slightly lower than expiring bonds.",
      "No team changes. Sarah Mthembu confirmed as PM for 2027 mandate renewal.",
    ],
    questions: [
      { id: "q1", text: "With CPI now at 3.8%, how are you protecting real returns if CPI falls below 3%?", source: "ai", checked: false },
      { id: "q2", text: "What is the reinvestment yield on the bonds rolling in Q1 and what is the impact?", source: "ai", checked: false },
      { id: "q3", text: "How liquid is the ILB market at current portfolio size — any execution concerns?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Alpine to provide scenario: real return at CPI 3.0%, 3.5% and 4.0%", done: false },
      { text: "2027 mandate renewal terms to be tabled by 15 December", done: false },
    ],
  },
  tidal: {
    perfMetrics: [
      ["1M excess", "+0.4pp", "positive"], ["3M excess", "+0.8pp", "positive"],
      ["1Y excess", "+1.0pp", "positive"], ["Latest quartile", "Q1", "positive"],
    ],
    changes: [
      "NextEra Energy added to portfolio at 4.2% — largest new position since inception.",
      "Vinci infrastructure stake increased to 6.8% — European grid investment accelerating.",
      "Energy transition weighting now at 68% of fund — above the 60% mandate minimum.",
      "ESG impact report published for FY2026 — CO₂ displaced: 2.4m tonnes.",
    ],
    questions: [
      { id: "q1", text: "What is the valuation case for NextEra at 4.2% — does regulation risk change the thesis?", source: "ai", checked: false },
      { id: "q2", text: "With energy transition at 68%, are you comfortable this concentrated above the 60% floor?", source: "ai", checked: false },
      { id: "q3", text: "How is the European regulatory environment for infrastructure changing your view on Vinci?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Tidal to provide full attribution for 1Y excess return by holding", done: false },
      { text: "ESG impact report filed — CO₂ metric included in quarterly board report", done: true },
    ],
  },
  meridian: {
    perfMetrics: [
      ["1M excess", "+0.4pp", "positive"], ["3M excess", "+0.7pp", "positive"],
      ["1Y excess", "+0.8pp", "positive"], ["Latest quartile", "Q2", "positive"],
    ],
    changes: [
      "SA equity allocation overweight maintained at 62% (benchmark 60%) after IC reaffirmed.",
      "Listed property allocation trimmed from 10% to 7% following Baobab underperformance analysis.",
      "SA bond duration slightly extended — in line with cutting cycle conviction.",
      "IC governance updated — now meeting monthly instead of bi-monthly.",
    ],
    questions: [
      { id: "q1", text: "How has the property trim from 10% to 7% been implemented and at what cost?", source: "ai", checked: false },
      { id: "q2", text: "With monthly IC meetings, has the pace of tactical tilts increased?", source: "ai", checked: false },
      { id: "q3", text: "What is the ceiling for the SA equity overweight in a mandate like this?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Meridian to provide attribution for property reduction impact on returns", done: false },
      { text: "Confirm monthly IC format is now standard — updated mandate docs required", done: false },
      { text: "Fee review confirmed at 0.75% — in line with peer median", done: true },
    ],
  },
  crest: {
    perfMetrics: [
      ["1M excess", "+0.2pp", "positive"], ["3M excess", "+0.4pp", "positive"],
      ["1Y excess", "+0.6pp", "positive"], ["Latest quartile", "Q1", "positive"],
    ],
    changes: [
      "ILB allocation trimmed from 20% to 15% as CPI declines reduce real-yield opportunity.",
      "SA cash allocation increased to 18% — Liezel Bosman increasing liquidity buffer.",
      "No structural SAA changes. Equity ceiling at 30% maintained.",
      "Downside scenario testing for FY2026 completed — no breaches of capital preservation target.",
    ],
    questions: [
      { id: "q1", text: "With CPI declining, is the ILB trim the right call — or could CPI surprise to the upside?", source: "ai", checked: false },
      { id: "q2", text: "With cash at 18%, how are you thinking about deploying that into bonds as yields fall?", source: "ai", checked: false },
      { id: "q3", text: "What is the 'floor' return that would trigger a mandate breach and how far are you from it?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Crest to provide downside scenario results for FY2026", done: true },
      { text: "Review ILB allocation rationale before next IC", done: false },
      { text: "2027 mandate renewal — conservative mandate reconfirmed by PM", done: false },
    ],
  },
  zenith: {
    perfMetrics: [
      ["1M excess", "−0.2pp", "negative"], ["3M excess", "−0.3pp", "negative"],
      ["1Y excess", "−0.6pp", "negative"], ["Latest quartile", "Q2", "neutral"],
    ],
    changes: [
      "Duration remains at 7.5y — above benchmark. PM maintains conviction on rate thesis.",
      "Italy and Spain allocations unchanged at 8% combined — spread risk remains elevated.",
      "USD currency hedge increased to 70% — PM reducing FX drag from EUR depreciation.",
    ],
    questions: [
      { id: "q1", text: "Given underperformance, at what point do you trim duration to protect the mandate?", source: "ai", checked: false },
      { id: "q2", text: "How is the European peripheral debt exposure (Italy, Spain) performing vs expectations?", source: "ai", checked: false },
      { id: "q3", text: "How do you think about the two active global bond mandates (Ridge and Zenith) overlapping?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Underperformance watch note raised — Zenith to present at IC in January 2027", done: false },
      { text: "Review whether Ridge and Zenith mandates can be rationalised", done: false },
    ],
  },
  kalahari: {
    perfMetrics: [
      ["1M excess", "+0.1pp", "positive"], ["3M excess", "+0.2pp", "positive"],
      ["1Y excess", "+0.3pp", "positive"], ["Latest quartile", "Q2", "positive"],
    ],
    changes: [
      "Korean battery supply chain stocks (10% of fund) outperformed — key driver of excess return.",
      "India SMID cap allocation increased to 28% — PM's highest conviction theme.",
      "New position in Vietnamese logistics company (1.5%) initiated — first ASEAN position.",
      "Liquidity minimum enforced — one holding trimmed after daily volume fell below threshold.",
    ],
    questions: [
      { id: "q1", text: "Korean battery sector — how are you managing the China EV demand risk within this theme?", source: "ai", checked: false },
      { id: "q2", text: "With India now at 28%, what is the maximum country concentration you would tolerate?", source: "ai", checked: false },
      { id: "q3", text: "Three years in — how are you thinking about the fund's track record sufficiency for a broader recommendation?", source: "pm", checked: false },
    ],
    actions: [
      { text: "Kalahari to provide 3-year performance attribution vs EM Small Cap Index", done: false },
      { text: "Liquidity management policy to be formalised in investment guidelines", done: false },
      { text: "Pilot allocation extended for 12 months — next IC review November 2027", done: true },
    ],
  },
};

const DEFAULT_PREP: FundPrepData = {
  perfMetrics: [
    ["1M excess", "—", "neutral"], ["3M excess", "—", "neutral"],
    ["1Y excess", "—", "neutral"], ["Latest quartile", "—", "neutral"],
  ],
  changes: ["No detailed data available for this fund yet."],
  questions: [
    { id: "q1", text: "Walk us through the fund's current positioning.", source: "ai", checked: false },
    { id: "q2", text: "Any team or process changes in the last quarter?", source: "ai", checked: false },
  ],
  actions: [],
};

function MeetingPrepTab({ perf, ab }: { perf: PerformanceData | null; ab: AlphaBetaData | null }) {
  const { state, dispatch } = useApp();
  const funds = ab?.funds ?? [];
  const selectedId = state.selectedFundId || "northstar";
  const fundData = funds.find(f => f.id === selectedId);
  const fundPrep = FUND_PREP[selectedId] ?? DEFAULT_PREP;

  const [questions, setQuestions] = useState<PrepQuestion[]>(fundPrep.questions);
  const [newQ, setNewQ] = useState("");
  const [innerTab, setInnerTab] = useState<"prep" | "insights">("prep");

  // Reset questions when fund changes
  const [lastFundId, setLastFundId] = useState(selectedId);
  if (selectedId !== lastFundId) {
    setLastFundId(selectedId);
    setQuestions((FUND_PREP[selectedId] ?? DEFAULT_PREP).questions);
  }

  const insights = state.pmInsights[selectedId] ?? { myView: "", pushOn: "", redFlags: "" };

  const nextMeeting = calendarEvents.find(e => e.category === "Meeting" && e.date >= "2026-11-23");

  function toggle(id: string) {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, checked: !q.checked } : q));
  }

  function addQuestion() {
    if (!newQ.trim()) return;
    setQuestions(qs => [...qs, { id: `custom-${Date.now()}`, text: newQ.trim(), source: "pm", checked: false }]);
    setNewQ("");
  }

  return (
    <div className="meetprep-layout">
      {/* Fund selector */}
      {funds.length > 0 && (
        <div className="research-fund-selector">
          <span className="research-fund-label">Fund</span>
          <select
            className="research-fund-select"
            value={selectedId}
            onChange={e => dispatch({ type: "SET_SELECTED_FUND", id: e.target.value })}
          >
            {funds.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {fundData && (
            <span className="research-fund-meta">
              {fundData.assetClass} · Q{fundData.currentQuartile}
            </span>
          )}
        </div>
      )}

      {/* Fund context header */}
      <div className="card meetprep-next-card">
        <div className="meetprep-next-label">Preparing for</div>
        <div className="meetprep-next-title">{fundData?.name ?? selectedId}</div>
        {nextMeeting && (
          <>
            <div className="meetprep-next-meta">{nextMeeting.date} · {nextMeeting.time} · {nextMeeting.portfolio}</div>
            <div className="meetprep-next-desc">{nextMeeting.description}</div>
          </>
        )}
      </div>

      {/* Inner tabs: Prep / My insights */}
      <div className="profile-inner-tabs" style={{ marginBottom: 0 }}>
        <button className={`profile-inner-tab${innerTab === "prep" ? " active" : ""}`} onClick={() => setInnerTab("prep")}>Prep</button>
        <button className={`profile-inner-tab${innerTab === "insights" ? " active" : ""}`} onClick={() => setInnerTab("insights")}>My insights</button>
      </div>

      {innerTab === "prep" && (
        <>
          {/* Performance summary */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Performance since last meeting</span>
              {perf && <SourceBadge meta={perf._meta} />}
            </div>
            <div className="meetprep-perf-grid">
              {fundPrep.perfMetrics.map(([label, val, cls]) => (
                <div key={label} className="meetprep-perf-cell">
                  <div className="meetprep-perf-label">{label}</div>
                  <div className={`meetprep-perf-val ${cls === "positive" ? "text-positive" : cls === "negative" ? "text-negative" : ""}`}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Changes since last meeting */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Changes since last meeting</span>
              <span className="monday-ai-label">AI draft</span>
            </div>
            <ul className="meetprep-changes">
              {fundPrep.changes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          {/* Suggested questions */}
          <div className="card">
            <div className="card-header"><span className="card-title">Suggested questions</span></div>
            <div className="meetprep-q-list">
              {questions.map(q => (
                <div key={q.id} className="meetprep-q-row">
                  <input type="checkbox" checked={q.checked} onChange={() => toggle(q.id)} className="meetprep-checkbox" />
                  <span className={`meetprep-q-text${q.checked ? " checked" : ""}`}>{q.text}</span>
                  {q.source === "ai" && <span className="monday-ai-label">AI draft</span>}
                </div>
              ))}
            </div>
            <div className="meetprep-add-row">
              <input
                className="meetprep-add-input"
                placeholder="Add your own question…"
                value={newQ}
                onChange={e => setNewQ(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addQuestion()}
              />
              <button className="btn-outline" onClick={addQuestion} style={{ padding: "6px 14px", fontSize: 13 }}>Add</button>
            </div>
          </div>

          {/* Open actions */}
          {fundPrep.actions.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">Open actions from last meeting</span></div>
              <div className="meetprep-actions-list">
                {fundPrep.actions.map((a, i) => (
                  <div key={i} className={`meetprep-action-row${a.done ? " done" : ""}`}>
                    <span className={`meetprep-action-dot${a.done ? " done" : ""}`} />
                    <span>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {innerTab === "insights" && (
        <div className="pm-insights-layout">
          <div className="card">
            <div className="card-header">
              <span className="card-title">My insights — {fundData?.name ?? selectedId}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Private notes, not shared</span>
            </div>
            {[
              { field: "myView" as const, label: "My view on this manager", ph: "What's your overall conviction level and why?" },
              { field: "pushOn" as const, label: "What I want to push on", ph: "Key topics, concerns or challenges you plan to raise…" },
              { field: "redFlags" as const, label: "Red flags to watch", ph: "Anything that would change your view — team risk, process drift, etc." },
            ].map(({ field, label, ph }) => (
              <div key={field} className="pm-insight-field">
                <div className="pm-insight-label">{label}</div>
                <textarea
                  className="meetprep-add-input"
                  style={{ minHeight: 80, resize: "vertical", display: "block", width: "100%", marginTop: 4 }}
                  placeholder={ph}
                  value={insights[field]}
                  onChange={e => dispatch({ type: "SET_PM_INSIGHT", fundId: selectedId, field, value: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
