import { useEffect, useState } from "react";
import Tabs from "../common/tabs/Tabs";
import { useActiveTab } from "../common/tabs/useActiveTab";
import SourceBadge from "../common/source-badge/SourceBadge";
import { useApp } from "../../context/AppContext";
import { getOutlookMeetings, type OutlookMeeting, type OutlookData } from "../../connectors/outlook";
import { getAlphaBetaData, type AlphaBetaData } from "../../connectors/alphaBeta";
import { getPerformanceData, type PerformanceData } from "../../connectors/performanceSystem";
import { fundUniverse } from "../../data";
import type { InterviewNote, Rating } from "../../context/AppContext";
import "./meetings.css";

const TABS = [
  { id: "meetings", label: "Meetings" },
  { id: "notes",    label: "Notes" },
  { id: "tasks",    label: "Tasks" },
];

export default function MeetingsNotesPage() {
  const tab = useActiveTab("calendar", "meetings");
  const [outlookData, setOutlookData] = useState<OutlookData | null>(null);
  const [ab, setAb] = useState<AlphaBetaData | null>(null);
  const [perf, setPerf] = useState<PerformanceData | null>(null);

  useEffect(() => { getOutlookMeetings().then(setOutlookData); }, []);
  useEffect(() => { getAlphaBetaData().then(setAb); }, []);
  useEffect(() => { getPerformanceData().then(setPerf); }, []);

  return (
    <div>
      <div className="page-heading">
        <div className="page-heading-text">
          <h1>Meetings &amp; Notes</h1>
          <p className="page-heading-sub">Upcoming meetings, interview notes and open actions</p>
        </div>
      </div>
      <Tabs page="calendar" tabs={TABS} />
      {tab === "meetings" && <MeetingsTab outlook={outlookData} />}
      {tab === "notes"    && <NotesTab ab={ab} />}
      {tab === "tasks"    && <TasksTab />}
      <PrepPackOverlay outlook={outlookData} ab={ab} perf={perf} />
    </div>
  );
}

/* ─── MEETINGS TAB ─────────────────────────────────────────── */

type MeetingFilter = "all" | "manager" | "aa-meeting" | "client";

const TYPE_LABEL: Record<string, string> = {
  manager: "Manager", "aa-meeting": "AA Meeting", client: "Client", other: "Other",
};
const TYPE_COLOR: Record<string, string> = {
  manager: "var(--brand-primary)", "aa-meeting": "var(--brand-accent)", client: "var(--positive)", other: "var(--text-muted)",
};
const PREP_COLOR: Record<string, string> = {
  ready: "var(--positive)", "needs-input": "var(--warning)", "not-started": "var(--text-muted)",
};
const PREP_BG: Record<string, string> = {
  ready: "var(--positive-bg)", "needs-input": "var(--warning-bg)", "not-started": "var(--surface-2)",
};
const PREP_LABEL: Record<string, string> = {
  ready: "Ready", "needs-input": "Needs input", "not-started": "Not started",
};

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
}

function groupMeetings(meetings: OutlookMeeting[]) {
  const today = "2026-11-24";
  const thisWeekEnd = "2026-11-29";
  const groups: Record<string, OutlookMeeting[]> = { Today: [], "This week": [], "Next week": [], Later: [] };
  meetings.forEach(m => {
    const d = m.start.slice(0, 10);
    if (d === today) groups["Today"].push(m);
    else if (d <= thisWeekEnd) groups["This week"].push(m);
    else if (d <= "2026-12-06") groups["Next week"].push(m);
    else groups["Later"].push(m);
  });
  return groups;
}

function MeetingsTab({ outlook }: { outlook: OutlookData | null }) {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<MeetingFilter>("all");

  if (!outlook) return <div className="prepare-placeholder">Loading…</div>;

  const visible = outlook.meetings.filter(m => {
    if (m.type === "other" && !state.showOtherMeetings) return false;
    if (filter === "all") return m.type !== "other" || state.showOtherMeetings;
    return m.type === filter;
  });

  const groups = groupMeetings(visible);

  function toast(msg: string) { dispatch({ type: "ADD_TOAST", message: msg }); }

  return (
    <div className="meetings-layout">
      <div className="meetings-toolbar">
        <div className="meetings-filters">
          {(["all", "manager", "aa-meeting", "client"] as MeetingFilter[]).map(f => (
            <button key={f} className={`pill${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : TYPE_LABEL[f]}
            </button>
          ))}
          <button
            className={`pill${state.showOtherMeetings ? " active" : ""}`}
            onClick={() => dispatch({ type: "TOGGLE_SHOW_OTHER_MEETINGS" })}
          >Other</button>
        </div>
        <SourceBadge meta={outlook._meta} />
      </div>

      {Object.entries(groups).map(([group, items]) => items.length === 0 ? null : (
        <div key={group} className="meeting-group">
          <div className="meeting-group-label">{group}</div>
          <div className="meeting-list card" style={{ padding: 0 }}>
            {items.map((m, i) => {
              const status = state.meetingPrepStatus[m.id] ?? "not-started";
              const fund = m.linkedManagerId ? fundUniverse.find(f => f.id === m.linkedManagerId) : null;
              return (
                <div key={m.id} className={`meeting-row${i < items.length - 1 ? " bordered" : ""}`}>
                  <div className="meeting-time">
                    <div className="meeting-time-date">{fmtDate(m.start)}</div>
                    <div className="meeting-time-clock">{fmt(m.start)}</div>
                  </div>
                  <div className="meeting-info">
                    <div className="meeting-title">{m.title}</div>
                    <div className="meeting-meta">
                      {m.isTeams ? <span className="meeting-location-teams">Teams</span> : <span className="meeting-location">{m.location}</span>}
                      {fund && <span className="meeting-linked-chip" style={{ color: "var(--brand-primary)" }}>{fund.name}</span>}
                    </div>
                  </div>
                  <div className="meeting-chips">
                    <span className="meeting-type-chip" style={{ color: TYPE_COLOR[m.type], background: `${TYPE_COLOR[m.type]}18` }}>
                      {TYPE_LABEL[m.type]}
                    </span>
                    <span className="meeting-prep-chip" style={{ color: PREP_COLOR[status], background: PREP_BG[status] }}>
                      {PREP_LABEL[status]}
                    </span>
                  </div>
                  <div className="meeting-actions">
                    {(m.type === "manager" || m.type === "aa-meeting") && (
                      <button className="btn-outline" style={{ padding: "5px 12px", fontSize: 12 }}
                        onClick={() => dispatch({ type: "OPEN_PREP_PACK", meetingId: m.id })}>
                        Open prep pack
                      </button>
                    )}
                    <button className="meeting-outlook-btn"
                      onClick={() => { toast("Link added to Outlook invite (simulated)"); }}>
                      + Outlook
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── PREP PACK OVERLAY ────────────────────────────────────── */

const MANAGER_QUESTIONS: Record<string, string[]> = {
  northstar: [
    "What drove the increase in US mega-cap concentration to 38% in Q3–Q4 2024?",
    "Has the team taken action to address the style drift identified in October?",
    "What is your outlook for quality-growth in a higher-for-longer rate environment?",
    "How do you think about position sizing for Nvidia at >6% of the fund?",
    "Any planned team changes for 2025?",
  ],
  umzi: [
    "How confident are you in the duration 6.2y position vs 5.4y benchmark?",
    "Walk us through your cutting-cycle thesis and when you expect to reduce duration.",
    "What is your credit quality breakdown and has it shifted this quarter?",
    "What is driving the consistently strong Q1 performance pattern?",
  ],
  protea: [
    "What is driving the financials concentration at 28%?",
    "How are you managing the risk of value underperformance in a momentum market?",
    "Tell us about the new research lead confirmed in October — what has changed?",
    "What is your view on SA consumer stocks given the rate-cutting cycle?",
  ],
};

function PrepPackOverlay({ outlook, ab, perf }: { outlook: OutlookData | null; ab: AlphaBetaData | null; perf: PerformanceData | null }) {
  const { state, dispatch } = useApp();
  const [checkedQs, setCheckedQs] = useState<Set<number>>(new Set());
  const [customQ, setCustomQ] = useState("");
  const [extraQs, setExtraQs] = useState<string[]>([]);

  const meetingId = state.prepPackMeetingId;
  if (!meetingId || !outlook) return null;

  const meeting = outlook.meetings.find(m => m.id === meetingId);
  if (!meeting) return null;

  function close() { dispatch({ type: "CLOSE_PREP_PACK" }); }
  function markReady() { dispatch({ type: "SET_MEETING_PREP_STATUS", meetingId, status: "ready" }); close(); }

  const isManager = meeting.type === "manager";
  const managerId = meeting.linkedManagerId ?? "";
  const fund = fundUniverse.find(f => f.id === managerId);
  const fundPerf = perf?.funds[managerId];
  const fundAB = ab?.funds.find(f => f.id === managerId);
  const questions = MANAGER_QUESTIONS[managerId] ?? [];
  const openTasks = state.tasks.filter(t => t.linkedId === managerId && t.status === "open");
  const latestNote = state.interviewNotes.find(n => n.fundId === managerId);
  const currentStatus = state.meetingPrepStatus[meetingId] ?? "not-started";

  function addQ() {
    if (!customQ.trim()) return;
    setExtraQs(q => [...q, customQ.trim()]);
    setCustomQ("");
  }

  return (
    <div className="preppack-overlay-backdrop" onClick={close}>
      <div className="preppack-overlay" onClick={e => e.stopPropagation()}>
        <div className="preppack-header">
          <div>
            <div className="preppack-eyebrow">{TYPE_LABEL[meeting.type]} · Prep Pack</div>
            <div className="preppack-title">{meeting.title}</div>
            <div className="preppack-meta">
              {fmtDate(meeting.start)} · {fmt(meeting.start)} · {meeting.location}
              {meeting.attendees.length > 0 && <> · {meeting.attendees.slice(0, 2).join(", ")}{meeting.attendees.length > 2 ? ` +${meeting.attendees.length - 2}` : ""}</>}
            </div>
          </div>
          <div className="preppack-header-actions">
            <span className="meeting-prep-chip" style={{ color: PREP_COLOR[currentStatus], background: PREP_BG[currentStatus], fontSize: 12 }}>
              {PREP_LABEL[currentStatus]}
            </span>
            <button className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }} onClick={markReady}>
              Mark as ready
            </button>
            <button className="icon-btn" onClick={close}>✕</button>
          </div>
        </div>

        <div className="preppack-body">
          {isManager && fund && (
            <>
              {/* Performance snapshot */}
              <section className="preppack-section card">
                <div className="card-header">
                  <span className="card-title">Performance snapshot</span>
                  {perf && <SourceBadge meta={perf._meta} />}
                </div>
                {fundPerf ? (
                  <div className="preppack-stat-grid">
                    {[
                      ["1M return",    `${fundPerf.return1M >= 0 ? "+" : ""}${fundPerf.return1M}%`, fundPerf.return1M >= 0 ? "text-positive" : "text-negative"],
                      ["1Y return",    `${fundPerf.return1Y}%`, ""],
                      ["1Y benchmark", `${fundPerf.benchmarkReturn1Y}%`, "text-muted"],
                      ["1Y excess",    `${fundPerf.excessReturn1Y >= 0 ? "+" : ""}${fundPerf.excessReturn1Y}pp`, fundPerf.excessReturn1Y >= 0 ? "text-positive" : "text-negative"],
                      ["3Y return",    `${fundPerf.return3Y}%`, ""],
                      ["Current quartile", `Q${fundAB?.currentQuartile ?? "—"}`, ""],
                      ["Consistency",  `${fundAB?.consistencyScore ?? "—"}`, ""],
                      ["Persistency",  `${fundAB?.persistencyScore ?? "—"}`, ""],
                    ].map(([lbl, val, cls]) => (
                      <div key={lbl} className="preppack-stat-item">
                        <div className="profile-stat-label">{lbl}</div>
                        <div className={`profile-stat-value ${cls}`} style={{ fontSize: 14 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-muted" style={{ fontSize: 13 }}>Performance data loading…</p>}
              </section>

              {/* Changes since last meeting */}
              <section className="preppack-section card">
                <div className="card-header">
                  <span className="card-title">Changes since last meeting</span>
                  <span className="monday-ai-label">AI draft</span>
                </div>
                <ul className="preppack-changes">
                  {managerId === "northstar" && <>
                    <li>US mega-cap concentration increased from 32% to 38% of portfolio.</li>
                    <li>Style drift score moved from 0.72 to 0.84 — more growth-biased.</li>
                    <li>Short-term performance recovered in Q3 (+2.1pp over 3 months).</li>
                    <li>No team changes confirmed since October check.</li>
                  </>}
                  {managerId === "umzi" && <>
                    <li>Duration position maintained at 6.2y vs 5.4y benchmark.</li>
                    <li>SA repo cut 25bps in October — full cutting cycle thesis intact.</li>
                    <li>Fee negotiation scheduled — scale-based step-down proposed.</li>
                  </>}
                  {managerId === "protea" && <>
                    <li>1Y excess return improved to +1.2pp since last meeting.</li>
                    <li>Financials weight increased to 28% of portfolio.</li>
                    <li>New research lead confirmed October 2024.</li>
                  </>}
                </ul>
              </section>

              {/* Open actions */}
              {openTasks.length > 0 && (
                <section className="preppack-section card">
                  <div className="card-header"><span className="card-title">Open actions from last meeting</span></div>
                  <div className="preppack-actions">
                    {openTasks.map(t => (
                      <div key={t.id} className="preppack-action-row">
                        <span className="preppack-action-dot" />
                        <span className="preppack-action-text">{t.description}</span>
                        <span className="preppack-action-due">Due {t.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Suggested questions */}
              <section className="preppack-section card">
                <div className="card-header">
                  <span className="card-title">Suggested questions</span>
                  <span className="monday-ai-label">AI draft</span>
                </div>
                <div className="preppack-q-list">
                  {[...questions, ...extraQs].map((q, i) => (
                    <div key={i} className="preppack-q-row">
                      <input type="checkbox" className="meetprep-checkbox"
                        checked={checkedQs.has(i)}
                        onChange={() => setCheckedQs(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })} />
                      <span className={`meetprep-q-text${checkedQs.has(i) ? " checked" : ""}`}>{q}</span>
                      {i < questions.length && <span className="monday-ai-label">AI draft</span>}
                    </div>
                  ))}
                </div>
                <div className="meetprep-add-row" style={{ marginTop: 10 }}>
                  <input className="meetprep-add-input" placeholder="Add your own question…" value={customQ}
                    onChange={e => setCustomQ(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addQ()} />
                  <button className="btn-outline" style={{ padding: "6px 14px", fontSize: 13 }} onClick={addQ}>Add</button>
                </div>
              </section>

              {/* Last interview note */}
              {latestNote && (
                <section className="preppack-section card">
                  <div className="card-header"><span className="card-title">Last interview note</span>
                    <span className="preppack-note-date">{latestNote.date}</span>
                  </div>
                  <div className="preppack-last-note">
                    <div className="preppack-note-scores">
                      {[["Team", latestNote.teamScore], ["Process", latestNote.processScore], ["Philosophy", latestNote.philosophyScore]].map(([lbl, v]) => (
                        <div key={lbl} className="preppack-note-score-item">
                          <div className="preppack-note-score-label">{lbl}</div>
                          <div className="preppack-note-score-val">{v}/5</div>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginTop: 10 }}>{latestNote.concerns || latestNote.process}</p>
                  </div>
                </section>
              )}
              {!latestNote && (
                <section className="preppack-section card" style={{ opacity: 0.6 }}>
                  <div className="card-title">Last interview note</div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>No interview note yet. Add one in the Notes tab.</p>
                </section>
              )}
            </>
          )}

          {meeting.type === "aa-meeting" && (
            <section className="preppack-section card">
              <div className="card-header"><span className="card-title">AA Meeting Pack status</span></div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>See Prepare → Pack for the latest deck status and auto/needs slides.</p>
              <button className="btn-outline" style={{ marginTop: 12, padding: "6px 14px", fontSize: 13 }}
                onClick={() => { dispatch({ type: "SET_SECTION_AND_TAB", id: "prepare", tab: "pack" }); close(); }}>
                Open Pack tab →
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── NOTES TAB ─────────────────────────────────────────────── */

type NoteTemplate = "manager-interview" | "aa-meeting" | "client" | "blank";

const TEMPLATE_LABELS: Record<NoteTemplate, string> = {
  "manager-interview": "Manager interview",
  "aa-meeting": "AA meeting",
  client: "Client meeting",
  blank: "Blank",
};

const SCORE_LABELS: Record<number, string> = { 1: "Poor", 2: "Below avg", 3: "Average", 4: "Strong", 5: "Exceptional" };

function scoreToRating(avg: number): Rating {
  if (avg >= 4) return "AAA";
  if (avg >= 3) return "AA";
  return "A";
}

function NotesTab({ ab: _ab }: { ab: AlphaBetaData | null }) {
  const { state, dispatch } = useApp();
  const [view, setView] = useState<"list" | "new">("list");
  const [template, setTemplate] = useState<NoteTemplate>("manager-interview");
  const [search, setSearch] = useState("");
  const [selectedFundId, setSelectedFundId] = useState("northstar");

  // Form state
  const [teamScore, setTeamScore] = useState(3);
  const [processScore, setProcessScore] = useState(3);
  const [philosophyScore, setPhilosophyScore] = useState(3);
  const [philosophy, setPhilosophy] = useState("");
  const [team, setTeam] = useState("");
  const [process, setProcess] = useState("");
  const [strengths, setStrengths] = useState("");
  const [concerns, setConcerns] = useState("");
  const [followUps, setFollowUps] = useState("");

  const notes = state.interviewNotes;
  const filtered = notes.filter(n =>
    search === "" || n.fundName.toLowerCase().includes(search.toLowerCase()) ||
    n.philosophy.toLowerCase().includes(search.toLowerCase()) ||
    n.concerns.toLowerCase().includes(search.toLowerCase())
  );

  function saveNote() {
    const avg = (teamScore + processScore + philosophyScore) / 3;
    const suggestedSkill = scoreToRating(avg);
    const note: InterviewNote = {
      id: `note-${Date.now()}`,
      fundId: selectedFundId,
      fundName: fundUniverse.find(f => f.id === selectedFundId)?.name ?? selectedFundId,
      date: "2026-11-24",
      teamScore, processScore, philosophyScore,
      philosophy, team, process, strengths, concerns, followUps,
    };
    dispatch({ type: "ADD_INTERVIEW_NOTE", note });
    dispatch({ type: "SET_FUND_RATING", fundId: selectedFundId, ratingType: "skill", rating: suggestedSkill });
    // Add any follow-up text as tasks
    if (followUps.trim()) {
      followUps.split("\n").filter(Boolean).forEach(line => {
        dispatch({
          type: "ADD_TASK",
          task: {
            id: `task-note-${Date.now()}-${Math.random()}`,
            description: line.trim(),
            owner: "PM · Luyolo",
            dueDate: "2026-12-15",
            linkedItem: note.fundName,
            linkedType: "fund",
            linkedId: selectedFundId,
            status: "open",
            source: "note",
            sourceNoteId: note.id,
          },
        });
      });
    }
    setView("list");
    setPhilosophy(""); setTeam(""); setProcess(""); setStrengths(""); setConcerns(""); setFollowUps("");
  }

  if (view === "new") {
    const avg = (teamScore + processScore + philosophyScore) / 3;
    const suggested = scoreToRating(avg);
    const existing = state.fundRatingOverrides[selectedFundId]?.skill;

    return (
      <div className="notes-new-layout">
        <div className="notes-new-header">
          <button className="btn-ghost-sm" onClick={() => setView("list")}>← Back</button>
          <span className="notes-new-title">New {TEMPLATE_LABELS[template]}</span>
        </div>

        {template === "manager-interview" && (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Fund</div>
              <div className="profile-selector">
                {fundUniverse.slice(0, 3).map(f => (
                  <button key={f.id} className={`profile-fund-btn${selectedFundId === f.id ? " active" : ""}`}
                    onClick={() => setSelectedFundId(f.id)}>{f.name}</button>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Interview scores (1–5)</div>
              <div className="interview-score-grid">
                {([["Team", teamScore, setTeamScore], ["Process", processScore, setProcessScore], ["Philosophy", philosophyScore, setPhilosophyScore]] as const).map(([lbl, val, setter]) => (
                  <div key={lbl} className="interview-score-row">
                    <div className="interview-score-label">{lbl}</div>
                    <div className="interview-score-pips">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} className={`interview-score-pip${n <= val ? " active" : ""}`}
                          onClick={() => setter(n)}>{n}</button>
                      ))}
                    </div>
                    <div className="interview-score-desc">{SCORE_LABELS[val]}</div>
                  </div>
                ))}
              </div>
              <div className="interview-rating-suggestion">
                <span>Suggested skill rating: </span>
                <strong style={{ color: suggested === "AAA" ? "var(--positive)" : suggested === "AA" ? "var(--brand-accent)" : "var(--warning)" }}>{suggested}</strong>
                {existing && existing !== suggested && (
                  <span className="interview-rating-current"> (current standing: <strong>{existing}</strong>)</span>
                )}
                <span className="interview-rating-note"> — will be applied on save</span>
              </div>
            </div>

            {(
              [
                { lbl: "Philosophy",               val: philosophy,  setter: setPhilosophy,  ph: "Notes on investment philosophy…" },
                { lbl: "Team",                      val: team,        setter: setTeam,         ph: "Team structure, stability, changes…" },
                { lbl: "Process",                   val: process,     setter: setProcess,      ph: "Process observations…" },
                { lbl: "Strengths",                 val: strengths,   setter: setStrengths,    ph: "Strengths identified…" },
                { lbl: "Concerns",                  val: concerns,    setter: setConcerns,     ph: "Concerns raised…" },
                { lbl: "Follow-ups / action items", val: followUps,   setter: setFollowUps,    ph: "One per line — each will become a task" },
              ] as { lbl: string; val: string; setter: (v: string) => void; ph: string }[]
            ).map(({ lbl, val, setter, ph }) => (
              <div key={lbl} className="card" style={{ marginBottom: 12 }}>
                <div className="card-title" style={{ marginBottom: 8 }}>{lbl}</div>
                <textarea className="monday-editor" rows={3} placeholder={ph}
                  value={val} onChange={e => setter(e.target.value)} />
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn-outline" style={{ padding: "8px 20px" }} onClick={() => setView("list")}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: "8px 20px" }} onClick={saveNote}>Save note</button>
            </div>
          </>
        )}

        {template !== "manager-interview" && (
          <div className="card">
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Template "{TEMPLATE_LABELS[template]}" coming soon.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="notes-tab-layout">
      <div className="notes-tab-toolbar">
        <input className="notes-search-input" placeholder="Search notes…" value={search}
          onChange={e => setSearch(e.target.value)} />
        <div className="notes-template-pills">
          {(Object.keys(TEMPLATE_LABELS) as NoteTemplate[]).map(t => (
            <button key={t} className={`pill${template === t ? " active" : ""}`}
              onClick={() => setTemplate(t)}>{TEMPLATE_LABELS[t]}</button>
          ))}
        </div>
        <button className="btn btn-primary" style={{ padding: "7px 16px", fontSize: 13, whiteSpace: "nowrap" }}
          onClick={() => setView("new")}>+ New note</button>
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: 13 }}>
          No interview notes yet. Click <strong>+ New note</strong> to add one.
        </div>
      )}

      <div className="notes-cards-grid">
        {filtered.map(n => (
          <div key={n.id} className="card note-card">
            <div className="note-card-header">
              <span className="note-card-fund">{n.fundName}</span>
              <span className="note-card-date">{n.date}</span>
            </div>
            <div className="note-card-scores">
              {[["T", n.teamScore], ["P", n.processScore], ["Ph", n.philosophyScore]].map(([lbl, v]) => (
                <span key={lbl} className="note-score-badge">{lbl}: {v}/5</span>
              ))}
              <span className="note-score-badge note-score-suggested">
                Skill → {scoreToRating((n.teamScore + n.processScore + n.philosophyScore) / 3)}
              </span>
            </div>
            {n.concerns && <p className="note-card-excerpt">Concerns: {n.concerns}</p>}
            {n.followUps && <p className="note-card-excerpt text-muted">Follow-ups: {n.followUps}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TASKS TAB ─────────────────────────────────────────────── */

const WORK_CYCLE = [
  { label: "Monthly AA pack", nextDue: "2026-12-02", total: 1, done: 0 },
  { label: "Quarterly manager reviews", nextDue: "2026-12-31", total: 15, done: 9 },
  { label: "Annual fee reviews", nextDue: "2027-01-31", total: 12, done: 3 },
];

function TasksTab() {
  const { state, dispatch } = useApp();
  const [newDesc, setNewDesc] = useState("");
  const [newDue, setNewDue] = useState("2026-12-15");
  const [newLinked, setNewLinked] = useState("General");

  function addTask() {
    if (!newDesc.trim()) return;
    dispatch({
      type: "ADD_TASK",
      task: {
        id: `task-manual-${Date.now()}`,
        description: newDesc.trim(),
        owner: "PM · Luyolo",
        dueDate: newDue,
        linkedItem: newLinked,
        linkedType: "other",
        status: "open",
        source: "manual",
      },
    });
    setNewDesc("");
  }

  const open = state.tasks.filter(t => t.status === "open");
  const done = state.tasks.filter(t => t.status === "done");

  return (
    <div className="tasks-layout">
      {/* Work cycle */}
      <div className="card">
        <div className="card-header"><span className="card-title">Work cycle</span></div>
        <div className="work-cycle-grid">
          {WORK_CYCLE.map(wc => (
            <div key={wc.label} className="work-cycle-item">
              <div className="work-cycle-label">{wc.label}</div>
              <div className="work-cycle-due">Next due: {wc.nextDue}</div>
              {wc.total > 1 && (
                <div className="work-cycle-progress">
                  <div className="work-cycle-bar-track">
                    <div className="work-cycle-bar-fill" style={{ width: `${(wc.done / wc.total) * 100}%` }} />
                  </div>
                  <span className="work-cycle-fraction">{wc.done}/{wc.total}</span>
                </div>
              )}
              <button className="meeting-outlook-btn" style={{ marginTop: 6 }}
                onClick={() => dispatch({ type: "ADD_TOAST", message: "Reminder sent (simulated)" })}>
                Remind in Teams
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add task */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Add action item</div>
        <div className="task-add-row">
          <input className="meetprep-add-input" style={{ flex: 2 }} placeholder="Description…"
            value={newDesc} onChange={e => setNewDesc(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()} />
          <input className="meetprep-add-input" type="date" value={newDue}
            onChange={e => setNewDue(e.target.value)} style={{ width: 140 }} />
          <input className="meetprep-add-input" placeholder="Linked to…" value={newLinked}
            onChange={e => setNewLinked(e.target.value)} style={{ width: 160 }} />
          <button className="btn-outline" style={{ padding: "6px 14px", fontSize: 13, whiteSpace: "nowrap" }} onClick={addTask}>Add</button>
        </div>
      </div>

      {/* Open tasks */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Open actions</span>
          <span className="monday-badge monday-badge-needs">{open.length}</span>
        </div>
        <div className="task-list">
          {open.map(t => (
            <div key={t.id} className="task-row">
              <button className="task-check open" onClick={() => dispatch({ type: "TOGGLE_TASK_STATUS", taskId: t.id })} title="Mark done">○</button>
              <div className="task-info">
                <div className="task-desc">{t.description}</div>
                <div className="task-meta">
                  <span className="task-linked">{t.linkedItem}</span>
                  <span className="task-due">Due {t.dueDate}</span>
                  <span className="task-owner">{t.owner}</span>
                </div>
              </div>
            </div>
          ))}
          {open.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "8px 0" }}>No open actions.</p>}
        </div>
      </div>

      {/* Done tasks */}
      {done.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ color: "var(--text-muted)" }}>Completed</span>
            <span className="monday-badge monday-badge-auto">{done.length}</span>
          </div>
          <div className="task-list">
            {done.map(t => (
              <div key={t.id} className="task-row task-row-done">
                <button className="task-check done" onClick={() => dispatch({ type: "TOGGLE_TASK_STATUS", taskId: t.id })} title="Reopen">✓</button>
                <div className="task-info">
                  <div className="task-desc">{t.description}</div>
                  <div className="task-meta">
                    <span className="task-linked">{t.linkedItem}</span>
                    <span className="task-due">Due {t.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
