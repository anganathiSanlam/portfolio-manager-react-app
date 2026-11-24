import { useEffect, useState } from "react";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import SourceBadge from "../common/source-badge/SourceBadge";
import { getAlphaBetaData, type AlphaBetaData, type Quartile } from "../../connectors/alphaBeta";
import { getPerformanceData, type PerformanceData } from "../../connectors/performanceSystem";
import { useApp } from "../../context/AppContext";
import { fundUniverse, calendarEvents } from "../../data";
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
      {tab === "meetprep"  && <MeetingPrepTab />}
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
    risk: {
      rating: "AAA",
      label: "High",
      description: "Concentrated global large-cap equity with elevated US mega-cap exposure (38%). Currency risk unhedged. Style drift toward growth increases sensitivity to rate moves.",
    },
    skill: {
      rating: "AA",
      label: "Strong",
      description: "Consistent top-quartile record over 5+ years. Disciplined sell discipline and low turnover indicate genuine stock-selection edge. Under active review following 2024 drift.",
    },
    esg: {
      rating: "AA",
      label: "ESG Integrated",
      e: "AAA", s: "AA", g: "AAA",
      note: "ESG fully integrated into stock selection. Proprietary scoring framework. Excludes thermal coal and controversial weapons. Annual engagement report published.",
    },
  },
  umzi: {
    risk: {
      rating: "A",
      label: "Low",
      description: "Investment-grade SA government and high-grade bonds. Duration 6.2y vs 5.4y benchmark — above-average interest-rate sensitivity but credit quality remains high.",
    },
    skill: {
      rating: "AA",
      label: "Strong",
      description: "Macro-driven duration calls have added consistent value through the cutting cycle. Monthly IC sign-off and transparent process. Highest consistency score in the SA bond peer group.",
    },
  },
  protea: {
    risk: {
      rating: "AA",
      label: "Moderate",
      description: "SA equity mandate with value bias. Concentration in financials (28%) adds sector risk. Domestic exposure means sensitivity to rand and macro cycle.",
    },
    skill: {
      rating: "A",
      label: "Adequate",
      description: "Recent outperformance (+1.2pp) validates value approach. Shorter track record for lead PM (9 years) vs peers. Research lead confirmed Oct 2024 adds depth.",
    },
  },
};

const FUND_QUAL: Record<string, {
  philosophy: string;
  team: string;
  process: string;
  strengths: string[];
  concerns: string[];
  lastInterview: string;
  whyWeHold: string;
  houseViewLink: string;
}> = {
  northstar: {
    philosophy: "Quality-growth investing in global large caps, targeting companies with durable competitive advantages and high returns on invested capital.",
    team: "Lead PM James Olivier (18 years). Two analysts added in 2023. No senior departures since 2022.",
    process: "Bottom-up stock selection, ESG-integrated, 30–50 holdings, low turnover (~20% p.a.).",
    strengths: ["Consistent long-term track record (pre-2024)", "Disciplined sell discipline", "Strong ESG integration"],
    concerns: ["Recent US mega-cap concentration", "Style drift toward larger market cap", "Q3–Q4 2024 performance lag"],
    lastInterview: "26 Sep 2024 — team discussed rising US concentration. PM acknowledged drift and indicated repositioning in Q4.",
    whyWeHold: "Provides quality-growth global equity exposure not easily replicated with passive. Under active review.",
    houseViewLink: "Global Equity (view: −1 — expensive, concentration risk)",
  },
  umzi: {
    philosophy: "Active duration management in SA government and high-grade bonds, exploiting yield-curve mispricing.",
    team: "Lead PM Thabo Dlamini (12 years). Team of 3 analysts stable since 2021.",
    process: "Macro-driven duration calls, credit quality focus, monthly IC sign-off on duration positions.",
    strengths: ["Consistent Q1 performance", "Transparent process", "Very competitive fee"],
    concerns: ["Duration 6.2y vs 5.4y benchmark — above-average interest-rate risk"],
    lastInterview: "14 Nov 2024 — reviewed duration positioning. PM confident in cutting cycle thesis.",
    whyWeHold: "Core SA bond exposure. Active duration is adding value and justified by cutting cycle house view.",
    houseViewLink: "SA Bonds (view: +2 — strong overweight, cutting cycle)",
  },
  protea: {
    philosophy: "Value-oriented SA equity investing, focusing on under-priced domestic companies with improving fundamentals.",
    team: "Lead PM Nomvula Khumalo (9 years). Research lead confirmed October 2024.",
    process: "Fundamental bottom-up with a macro overlay. 25–35 holdings, medium turnover.",
    strengths: ["Strong recent outperformance (+1.2pp)", "Genuine value bias in portfolio", "Stable team"],
    concerns: ["Concentration in financials (28%)", "Value style can lag in momentum markets"],
    lastInterview: "09 Oct 2024 — solid review. No concerns raised. Next review February 2025.",
    whyWeHold: "Provides differentiated value exposure to SA equities. Ahead of benchmark and within mandate.",
    houseViewLink: "SA Equity (view: +1 — overweight, cheap on PE)",
  },
};

const RATING_LEVELS: Rating[] = ["A", "AA", "AAA"];

function RatingBadge({ rating, color }: { rating: Rating; color: string }) {
  const filled = RATING_LEVELS.indexOf(rating) + 1;
  return (
    <div className="rating-segments">
      {RATING_LEVELS.map((lvl, i) => (
        <span
          key={lvl}
          className={`rating-segment${i < filled ? " filled" : ""}`}
          style={i < filled ? { background: color } : {}}
        >
          {lvl}
        </span>
      ))}
    </div>
  );
}

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
  const ratings = FUND_RATINGS[selectedId];
  if (!ratings) return <div className="prepare-placeholder">No ratings available for this fund.</div>;

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
          <div className="rating-score-block">
            <RatingBadge rating={ratings.risk.rating} color={rc} />
            <div className="rating-score-num" style={{ color: rc }}>{ratings.risk.rating}</div>
          </div>
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
          <div className="rating-score-block">
            <RatingBadge rating={ratings.skill.rating} color={sc} />
            <div className="rating-score-num" style={{ color: sc }}>{ratings.skill.rating}</div>
          </div>
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
            <div className="rating-score-block">
              <RatingBadge rating={ratings.esg.rating} color={esgColor(ratings.esg.rating)} />
              <div className="rating-score-num" style={{ color: esgColor(ratings.esg.rating) }}>{ratings.esg.rating}</div>
            </div>
          </div>
          <div className="esg-pillars">
            {([["E", ratings.esg.e, "Environmental"], ["S", ratings.esg.s, "Social"], ["G", ratings.esg.g, "Governance"]] as const).map(([, val, fullLabel]) => (
              <div key={fullLabel} className="esg-pillar">
                <div className="esg-pillar-label">{fullLabel}</div>
                <RatingBadge rating={val} color={esgColor(val)} />
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

function ManagerProfileTab({ perf }: { perf: PerformanceData | null; ab: AlphaBetaData | null }) {
  const { dispatch } = useApp();
  const funds = fundUniverse;
  const [selectedId, setSelectedId] = useState("northstar");
  const [profileTab, setProfileTab] = useState<"overview" | "ratings">("overview");
  const fund = funds.find(f => f.id === selectedId);
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
      <div className="profile-selector">
        {funds.map(f => (
          <button
            key={f.id}
            className={`profile-fund-btn${selectedId === f.id ? " active" : ""}`}
            onClick={() => setSelectedId(f.id)}
          >
            {f.name}
          </button>
        ))}
      </div>

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
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MEETING PREP ───────────────────────────────────────── */

const QUESTIONS: Array<{ id: string; text: string; source: "ai" | "pm"; checked: boolean }> = [
  { id: "q1", text: "What drove the increase in US mega-cap concentration in Q3–Q4 2024?", source: "ai", checked: false },
  { id: "q2", text: "Has the team taken any action to reduce the style drift identified in October?", source: "ai", checked: false },
  { id: "q3", text: "What is the outlook for the quality-growth factor in a higher-for-longer rate environment?", source: "ai", checked: false },
  { id: "q4", text: "How do you think about position sizing for Nvidia at >6% of the fund?", source: "pm", checked: true },
  { id: "q5", text: "Any team changes planned for 2025?", source: "pm", checked: true },
];

function MeetingPrepTab() {
  const [questions, setQuestions] = useState(QUESTIONS);
  const [newQ, setNewQ] = useState("");

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
      {/* Next meeting card */}
      {nextMeeting && (
        <div className="card meetprep-next-card">
          <div className="meetprep-next-label">Next meeting</div>
          <div className="meetprep-next-title">{nextMeeting.title}</div>
          <div className="meetprep-next-meta">{nextMeeting.date} · {nextMeeting.time} · {nextMeeting.portfolio}</div>
          <div className="meetprep-next-desc">{nextMeeting.description}</div>
        </div>
      )}

      {/* Performance summary */}
      <div className="card">
        <div className="card-header"><span className="card-title">Performance summary since last meeting</span></div>
        <div className="meetprep-perf-grid">
          {[
            ["1M excess", "−1.8pp", "negative"], ["3M excess", "+2.1pp", "positive"],
            ["1Y excess", "−2.1pp", "negative"], ["Quartile (Q3 2024)", "Q2", "neutral"],
          ].map(([label, val, cls]) => (
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
          <li>US mega-cap concentration increased from 32% to 38% of the portfolio.</li>
          <li>Style drift identified — value/growth score moved from 0.72 to 0.84 (more growth-biased).</li>
          <li>Short-term performance recovered in Q3 (+2.1pp over 3 months) after a weak H1.</li>
          <li>No team changes confirmed since the October check.</li>
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
      <div className="card">
        <div className="card-header"><span className="card-title">Open actions from last meeting</span></div>
        <div className="meetprep-actions-list">
          {[
            { text: "Northstar to provide attribution for US mega-cap concentration by 15 Nov", done: false },
            { text: "PM to review style drift against mandate tolerance", done: false },
            { text: "Fee schedule confirmed at 1.00% — no changes", done: true },
          ].map((a, i) => (
            <div key={i} className={`meetprep-action-row${a.done ? " done" : ""}`}>
              <span className={`meetprep-action-dot${a.done ? " done" : ""}`} />
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
