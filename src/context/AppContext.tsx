import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { NoteRecord } from "../data/types";
import { noteRecords as initialNoteRecords } from "../data";
import type { PrepStatus } from "../connectors/outlook";

export type Rating = "A" | "AA" | "AAA";

export interface InterviewNote {
  id: string;
  fundId: string;
  fundName: string;
  date: string;         // YYYY-MM-DD
  linkedMeetingId?: string;
  teamScore: number;        // 1–5
  processScore: number;     // 1–5
  philosophyScore: number;  // 1–5
  philosophy: string;
  team: string;
  process: string;
  strengths: string;
  concerns: string;
  followUps: string;
}

export interface Task {
  id: string;
  description: string;
  owner: string;
  dueDate: string;      // YYYY-MM-DD
  linkedItem: string;
  linkedType: "fund" | "manager" | "meeting" | "other";
  linkedId?: string;
  status: "open" | "done";
  source: "note" | "manual";
  sourceNoteId?: string;
}

export interface AppState {
  activeSection: string;
  portfolio: string;
  approved: Set<string>;
  selectedRole: string;
  agentsPaused: boolean;
  calendarMonth: Date;
  selectedCalendarDate: string;
  portfolioTab: string;
  portfolioRange: string;
  fundView: string;
  fundFilter: string;
  selectedFundId: string;
  fundEvidenceOpen: boolean;
  fundOutputFlagged: boolean;
  fundReviewRequestedIds: Set<string>;
  fundMeetingQuestionAddedIds: Set<string>;
  fundCommitteePaperPrepared: boolean;
  fundCurrentMixKept: boolean;
  watchedFunds: Set<string>;
  managerView: string;
  managerFilter: string;
  selectedManagerId: string;
  managerModal: string;
  managerResearchRequested: boolean;
  managerTalkingPointRecorded: boolean;
  roleModalOpen: boolean;
  selectedNoteId: string;
  notesModal: string;
  notesSearchOpen: boolean;
  notesSearch: string;
  noteDrafts: Record<string, { title: string; talkingPoints: string[]; meetingRecord: string; actionItems: string[] }>;
  noteStatuses: Record<string, string>;
  noteShared: Record<string, boolean>;
  noteWhyOpen: boolean;
  noteSequence: number;
  noteRecords: NoteRecord[];
  dataHealthModal: string;
  dataHealthResolved: boolean;
  dataHealthHold: boolean;
  dataHealthRemember: boolean;
  dataHealthReason: string;
  dataHealthSource: string;
  auditModal: string;
  auditSearch: string;
  auditScope: string;
  riskModal: string;
  riskScenario: string;
  riskShockPercent: number;
  riskCustomShockPercent: number;
  rebalanceView: string;
  rebalanceModal: string;
  rebalanceBondPurchase: number;
  rebalanceStage: string;
  rebalanceDeclineReason: string;
  assistantOpen: boolean;
  auditPanelOpen: boolean;
  drawerOpen: boolean;
  drawerTitle: string;
  drawerDescription: string;
  drawerFundId: string;
  pageTab: Record<string, string>;
  toasts: string[];
  meetingPrepStatus: Record<string, PrepStatus>;
  interviewNotes: InterviewNote[];
  tasks: Task[];
  fundRatingOverrides: Record<string, { risk?: Rating; skill?: Rating; esg?: Rating }>;
  prepPackMeetingId: string;   // empty = overlay closed
  showOtherMeetings: boolean;
  pmInsights: Record<string, { myView: string; pushOn: string; redFlags: string }>;
  packQueue: PackItem[];
  selectedClientId: string;
  clientNotes: Record<string, string>;
}

export interface PackItem {
  id: string;
  title: string;
  section: string;    // e.g. "markets", "economy"
  sourceTab: string;  // the prepare tab it came from
}

export type AppAction =
  | { type: "SET_SECTION"; id: string }
  | { type: "SET_PORTFOLIO"; name: string }
  | { type: "SET_ROLE"; name: string }
  | { type: "TOGGLE_AGENTS_PAUSED" }
  | { type: "APPROVE_DECISION"; decision: string }
  | { type: "SET_CALENDAR_MONTH"; month: Date }
  | { type: "SET_CALENDAR_DATE"; date: string }
  | { type: "SET_PORTFOLIO_TAB"; tab: string }
  | { type: "SET_PORTFOLIO_RANGE"; range: string }
  | { type: "SET_FUND_VIEW"; view: string }
  | { type: "SET_FUND_FILTER"; filter: string }
  | { type: "SET_SELECTED_FUND"; id: string }
  | { type: "SET_FUND_EVIDENCE_OPEN"; open: boolean }
  | { type: "TOGGLE_FUND_OUTPUT_FLAGGED" }
  | { type: "TOGGLE_FUND_REVIEW_REQUESTED"; id: string }
  | { type: "TOGGLE_FUND_MEETING_QUESTION"; id: string }
  | { type: "TOGGLE_FUND_COMMITTEE_PAPER" }
  | { type: "TOGGLE_FUND_CURRENT_MIX_KEPT" }
  | { type: "TOGGLE_WATCHED_FUND"; id: string }
  | { type: "SET_MANAGER_VIEW"; view: string; managerId?: string }
  | { type: "SET_MANAGER_FILTER"; filter: string }
  | { type: "SET_MANAGER_MODAL"; modal: string }
  | { type: "SET_MANAGER_RESEARCH_REQUESTED"; value: boolean }
  | { type: "SET_MANAGER_TALKING_POINT_RECORDED"; value: boolean }
  | { type: "SET_ROLE_MODAL_OPEN"; open: boolean }
  | { type: "SET_NOTE_ID"; id: string }
  | { type: "SET_NOTES_MODAL"; modal: string }
  | { type: "SET_NOTES_SEARCH_OPEN"; open: boolean }
  | { type: "SET_NOTES_SEARCH"; search: string }
  | { type: "SAVE_NOTE_DRAFT"; noteId: string; draft: { title: string; talkingPoints: string[]; meetingRecord: string; actionItems: string[] } }
  | { type: "SET_NOTE_STATUS"; noteId: string; status: string }
  | { type: "SET_NOTE_SHARED"; noteId: string; shared: boolean }
  | { type: "TOGGLE_NOTE_WHY" }
  | { type: "FINALISE_NOTE"; noteId: string }
  | { type: "RESTORE_NOTE_VERSION"; noteId: string; versionIndex: number }
  | { type: "SET_DATA_HEALTH_MODAL"; modal: string }
  | { type: "RESOLVE_DATA_HEALTH"; source: string }
  | { type: "SET_DATA_HEALTH_HOLD"; value: boolean }
  | { type: "TOGGLE_DATA_HEALTH_REMEMBER" }
  | { type: "SET_DATA_HEALTH_REASON"; reason: string }
  | { type: "SET_AUDIT_MODAL"; modal: string }
  | { type: "SET_AUDIT_SEARCH"; search: string }
  | { type: "SET_AUDIT_SCOPE"; scope: string }
  | { type: "SET_RISK_MODAL"; modal: string }
  | { type: "SET_RISK_SCENARIO"; scenario: string; shock: number }
  | { type: "SET_RISK_CUSTOM_SHOCK"; percent: number }
  | { type: "SET_REBALANCE_VIEW"; view: string }
  | { type: "SET_REBALANCE_MODAL"; modal: string }
  | { type: "SET_REBALANCE_BOND_PURCHASE"; amount: number }
  | { type: "SET_REBALANCE_STAGE"; stage: string }
  | { type: "SET_REBALANCE_DECLINE_REASON"; reason: string }
  | { type: "SET_PAGE_TAB"; page: string; tab: string }
  | { type: "SET_SECTION_AND_TAB"; id: string; tab: string }
  | { type: "SET_ASSISTANT_OPEN"; open: boolean }
  | { type: "SET_AUDIT_PANEL_OPEN"; open: boolean }
  | { type: "OPEN_DRAWER"; title: string; description: string; fundId?: string }
  | { type: "CLOSE_DRAWER" }
  | { type: "ADD_TOAST"; message: string }
  | { type: "REMOVE_TOAST"; message: string }
  | { type: "SET_MEETING_PREP_STATUS"; meetingId: string; status: PrepStatus }
  | { type: "ADD_INTERVIEW_NOTE"; note: InterviewNote }
  | { type: "ADD_TASK"; task: Task }
  | { type: "TOGGLE_TASK_STATUS"; taskId: string }
  | { type: "SET_FUND_RATING"; fundId: string; ratingType: "risk" | "skill" | "esg"; rating: Rating }
  | { type: "OPEN_PREP_PACK"; meetingId: string }
  | { type: "CLOSE_PREP_PACK" }
  | { type: "TOGGLE_SHOW_OTHER_MEETINGS" }
  | { type: "SET_PM_INSIGHT"; fundId: string; field: "myView" | "pushOn" | "redFlags"; value: string }
  | { type: "ADD_TO_PACK"; item: PackItem }
  | { type: "REMOVE_FROM_PACK"; id: string }
  | { type: "REORDER_PACK"; fromIndex: number; toIndex: number }
  | { type: "CLEAR_PACK" }
  | { type: "SET_SELECTED_CLIENT"; id: string }
  | { type: "SET_CLIENT_NOTE"; clientId: string; note: string };

const initialState: AppState = {
  activeSection: "prepare",
  portfolio: "Moderate portfolio",
  approved: new Set(),
  selectedRole: "PM · Luyolo",
  agentsPaused: false,
  calendarMonth: new Date(2026, 10, 1),
  selectedCalendarDate: "2026-11-17",
  portfolioTab: "portfolio",
  portfolioRange: "1Y",
  fundView: "list",
  fundFilter: "all",
  selectedFundId: "northstar",
  fundEvidenceOpen: false,
  fundOutputFlagged: false,
  fundReviewRequestedIds: new Set(),
  fundMeetingQuestionAddedIds: new Set(),
  fundCommitteePaperPrepared: false,
  fundCurrentMixKept: false,
  watchedFunds: new Set(["northstar", "other-watch"]),
  managerView: "overview",
  managerFilter: "all",
  selectedManagerId: "umzi",
  managerModal: "",
  managerResearchRequested: false,
  managerTalkingPointRecorded: false,
  roleModalOpen: false,
  selectedNoteId: "umzi-quarterly",
  notesModal: "",
  notesSearchOpen: false,
  notesSearch: "",
  noteDrafts: {},
  noteStatuses: {},
  noteShared: {},
  noteWhyOpen: false,
  noteSequence: 0,
  noteRecords: initialNoteRecords,
  dataHealthModal: "",
  dataHealthResolved: false,
  dataHealthHold: false,
  dataHealthRemember: false,
  dataHealthReason: "performance",
  dataHealthSource: "",
  auditModal: "",
  auditSearch: "",
  auditScope: "all",
  riskModal: "",
  riskScenario: "shares",
  riskShockPercent: 25,
  riskCustomShockPercent: 25,
  rebalanceView: "proposal",
  rebalanceModal: "",
  rebalanceBondPurchase: 120,
  rebalanceStage: "proposed",
  rebalanceDeclineReason: "",
  assistantOpen: false,
  auditPanelOpen: false,
  drawerOpen: false,
  drawerTitle: "",
  drawerDescription: "",
  drawerFundId: "",
  pageTab: {},
  toasts: [],
  meetingPrepStatus: {
    "meet-001": "needs-input",
    "meet-002": "not-started",
    "meet-003": "not-started",
    "meet-004": "needs-input",
    "meet-005": "not-started",
    "meet-006": "not-started",
    "meet-007": "not-started",
    "meet-008": "not-started",
  },
  interviewNotes: [],
  tasks: [
    { id: "task-001", description: "Northstar to provide attribution for US mega-cap concentration", owner: "Northstar PM", dueDate: "2026-12-05", linkedItem: "Northstar Global Equity", linkedType: "fund", linkedId: "northstar", status: "open", source: "manual" },
    { id: "task-002", description: "Review style drift against mandate tolerance", owner: "PM · Luyolo", dueDate: "2026-11-30", linkedItem: "Northstar Global Equity", linkedType: "fund", linkedId: "northstar", status: "open", source: "manual" },
    { id: "task-003", description: "Confirm Northstar fee schedule at 1.00%", owner: "PM · Luyolo", dueDate: "2026-11-25", linkedItem: "Northstar Global Equity", linkedType: "fund", linkedId: "northstar", status: "done", source: "manual" },
    { id: "task-004", description: "Prepare December IC pack slides", owner: "PM · Luyolo", dueDate: "2026-11-27", linkedItem: "IC December", linkedType: "other", status: "open", source: "manual" },
  ],
  fundRatingOverrides: {},
  prepPackMeetingId: "",
  showOtherMeetings: false,
  pmInsights: {},
  packQueue: [],
  selectedClientId: "c001",
  clientNotes: {},
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_SECTION": {
      const id = action.id;
      return {
        ...state,
        activeSection: id,
        roleModalOpen: false,
        fundView: id === "funds" ? "list" : state.fundView,
        fundFilter: id === "funds" ? "all" : state.fundFilter,
        fundEvidenceOpen: id === "funds" ? false : id !== "funds" ? false : state.fundEvidenceOpen,
        managerView: id === "managers" ? "overview" : state.managerView,
        managerFilter: id === "managers" ? "all" : state.managerFilter,
        managerModal: id === "managers" ? "" : id !== "managers" ? "" : state.managerModal,
        rebalanceView: id === "rebalance" ? "proposal" : state.rebalanceView,
        rebalanceModal: id !== "rebalance" ? "" : state.rebalanceModal,
        riskModal: id !== "risk" ? "" : state.riskModal,
        notesModal: id !== "notes" ? "" : state.notesModal,
        dataHealthModal: id !== "data-health" ? "" : state.dataHealthModal,
        auditModal: id !== "audit" ? "" : state.auditModal
      };
    }
    case "SET_PORTFOLIO": return { ...state, portfolio: action.name };
    case "SET_ROLE": return { ...state, selectedRole: action.name, roleModalOpen: false };
    case "TOGGLE_AGENTS_PAUSED": return { ...state, agentsPaused: !state.agentsPaused };
    case "APPROVE_DECISION": {
      const approved = new Set(state.approved);
      approved.add(action.decision);
      return { ...state, approved };
    }
    case "SET_CALENDAR_MONTH": return { ...state, calendarMonth: action.month };
    case "SET_CALENDAR_DATE": return { ...state, selectedCalendarDate: action.date };
    case "SET_PORTFOLIO_TAB": return { ...state, portfolioTab: action.tab };
    case "SET_PORTFOLIO_RANGE": return { ...state, portfolioRange: action.range };
    case "SET_FUND_VIEW": return { ...state, fundView: action.view, fundEvidenceOpen: false };
    case "SET_FUND_FILTER": return { ...state, fundFilter: action.filter };
    case "SET_SELECTED_FUND": return { ...state, selectedFundId: action.id, fundView: "detail" };
    case "SET_FUND_EVIDENCE_OPEN": return { ...state, fundEvidenceOpen: action.open };
    case "TOGGLE_FUND_OUTPUT_FLAGGED": return { ...state, fundOutputFlagged: !state.fundOutputFlagged };
    case "TOGGLE_FUND_REVIEW_REQUESTED": {
      const ids = new Set(state.fundReviewRequestedIds);
      if (ids.has(action.id)) ids.delete(action.id); else ids.add(action.id);
      return { ...state, fundReviewRequestedIds: ids };
    }
    case "TOGGLE_FUND_MEETING_QUESTION": {
      const ids = new Set(state.fundMeetingQuestionAddedIds);
      if (ids.has(action.id)) ids.delete(action.id); else ids.add(action.id);
      return { ...state, fundMeetingQuestionAddedIds: ids };
    }
    case "TOGGLE_FUND_COMMITTEE_PAPER": return { ...state, fundCommitteePaperPrepared: !state.fundCommitteePaperPrepared };
    case "TOGGLE_FUND_CURRENT_MIX_KEPT": return { ...state, fundCurrentMixKept: !state.fundCurrentMixKept };
    case "TOGGLE_WATCHED_FUND": {
      const watched = new Set(state.watchedFunds);
      if (watched.has(action.id)) watched.delete(action.id); else watched.add(action.id);
      return { ...state, watchedFunds: watched };
    }
    case "SET_MANAGER_VIEW": return { ...state, managerView: action.view, selectedManagerId: action.managerId ?? state.selectedManagerId, managerModal: "" };
    case "SET_MANAGER_FILTER": return { ...state, managerFilter: action.filter };
    case "SET_MANAGER_MODAL": return { ...state, managerModal: action.modal };
    case "SET_MANAGER_RESEARCH_REQUESTED": return { ...state, managerResearchRequested: action.value };
    case "SET_MANAGER_TALKING_POINT_RECORDED": return { ...state, managerTalkingPointRecorded: action.value };
    case "SET_ROLE_MODAL_OPEN": return { ...state, roleModalOpen: action.open };
    case "SET_NOTE_ID": return { ...state, selectedNoteId: action.id };
    case "SET_NOTES_MODAL": return { ...state, notesModal: action.modal };
    case "SET_NOTES_SEARCH_OPEN": return { ...state, notesSearchOpen: action.open };
    case "SET_NOTES_SEARCH": return { ...state, notesSearch: action.search };
    case "SAVE_NOTE_DRAFT": {
      const records = state.noteRecords.map((n) =>
        n.id === action.noteId ? { ...n, title: action.draft.title, talkingPoints: [...action.draft.talkingPoints], meetingRecord: action.draft.meetingRecord, actionItems: [...action.draft.actionItems] } : n
      );
      const statuses = { ...state.noteStatuses, [action.noteId]: "Saved draft · just now" };
      const drafts = { ...state.noteDrafts };
      delete drafts[action.noteId];
      return { ...state, noteRecords: records, noteStatuses: statuses, noteDrafts: drafts };
    }
    case "SET_NOTE_STATUS": return { ...state, noteStatuses: { ...state.noteStatuses, [action.noteId]: action.status } };
    case "SET_NOTE_SHARED": return { ...state, noteShared: { ...state.noteShared, [action.noteId]: action.shared } };
    case "TOGGLE_NOTE_WHY": return { ...state, noteWhyOpen: !state.noteWhyOpen };
    case "FINALISE_NOTE": {
      const records = state.noteRecords.map((n) => n.id === action.noteId ? { ...n, finalised: true, status: "Final · immutable" } : n);
      return { ...state, noteRecords: records, noteStatuses: { ...state.noteStatuses, [action.noteId]: "Final · immutable" }, noteSequence: state.noteSequence + 1 };
    }
    case "RESTORE_NOTE_VERSION": {
      const rec = state.noteRecords.find((n) => n.id === action.noteId);
      if (!rec || !rec.versions[action.versionIndex]) return state;
      const v = rec.versions[action.versionIndex];
      const drafts = { ...state.noteDrafts, [action.noteId]: { title: v.title, talkingPoints: [...v.talkingPoints], meetingRecord: v.meetingRecord, actionItems: [...v.actionItems] } };
      return { ...state, noteDrafts: drafts, noteStatuses: { ...state.noteStatuses, [action.noteId]: "Restored from version history · unsaved" } };
    }
    case "SET_DATA_HEALTH_MODAL": return { ...state, dataHealthModal: action.modal };
    case "RESOLVE_DATA_HEALTH": return { ...state, dataHealthResolved: true, dataHealthHold: false, dataHealthSource: action.source, dataHealthModal: "" };
    case "SET_DATA_HEALTH_HOLD": return { ...state, dataHealthHold: action.value, dataHealthModal: "" };
    case "TOGGLE_DATA_HEALTH_REMEMBER": return { ...state, dataHealthRemember: !state.dataHealthRemember };
    case "SET_DATA_HEALTH_REASON": return { ...state, dataHealthReason: action.reason };
    case "SET_AUDIT_MODAL": return { ...state, auditModal: action.modal };
    case "SET_AUDIT_SEARCH": return { ...state, auditSearch: action.search };
    case "SET_AUDIT_SCOPE": return { ...state, auditScope: action.scope, auditSearch: "", auditModal: "" };
    case "SET_RISK_MODAL": return { ...state, riskModal: action.modal };
    case "SET_RISK_SCENARIO": return { ...state, riskScenario: action.scenario, riskShockPercent: action.shock, riskModal: "scenario" };
    case "SET_RISK_CUSTOM_SHOCK": return { ...state, riskCustomShockPercent: action.percent };
    case "SET_REBALANCE_VIEW": return { ...state, rebalanceView: action.view };
    case "SET_REBALANCE_MODAL": return { ...state, rebalanceModal: action.modal };
    case "SET_REBALANCE_BOND_PURCHASE": return { ...state, rebalanceBondPurchase: action.amount };
    case "SET_REBALANCE_STAGE": return { ...state, rebalanceStage: action.stage, rebalanceModal: "" };
    case "SET_REBALANCE_DECLINE_REASON": return { ...state, rebalanceDeclineReason: action.reason };
    case "SET_PAGE_TAB": return { ...state, pageTab: { ...state.pageTab, [action.page]: action.tab } };
    case "SET_SECTION_AND_TAB": {
      const withSection = reducer(state, { type: "SET_SECTION", id: action.id });
      return { ...withSection, pageTab: { ...withSection.pageTab, [action.id]: action.tab } };
    }
    case "SET_ASSISTANT_OPEN": return { ...state, assistantOpen: action.open };
    case "SET_AUDIT_PANEL_OPEN": return { ...state, auditPanelOpen: action.open };
    case "OPEN_DRAWER": return { ...state, drawerOpen: true, drawerTitle: action.title, drawerDescription: action.description, drawerFundId: action.fundId ?? "" };
    case "CLOSE_DRAWER": return { ...state, drawerOpen: false, drawerFundId: "" };
    case "ADD_TOAST": return { ...state, toasts: [...state.toasts, action.message] };
    case "REMOVE_TOAST": return { ...state, toasts: state.toasts.filter((t) => t !== action.message) };
    case "SET_MEETING_PREP_STATUS": return { ...state, meetingPrepStatus: { ...state.meetingPrepStatus, [action.meetingId]: action.status } };
    case "ADD_INTERVIEW_NOTE": return { ...state, interviewNotes: [action.note, ...state.interviewNotes] };
    case "ADD_TASK": return { ...state, tasks: [action.task, ...state.tasks] };
    case "TOGGLE_TASK_STATUS": return { ...state, tasks: state.tasks.map(t => t.id === action.taskId ? { ...t, status: t.status === "open" ? "done" : "open" } : t) };
    case "SET_FUND_RATING": {
      const existing = state.fundRatingOverrides[action.fundId] ?? {};
      return { ...state, fundRatingOverrides: { ...state.fundRatingOverrides, [action.fundId]: { ...existing, [action.ratingType]: action.rating } } };
    }
    case "OPEN_PREP_PACK": return { ...state, prepPackMeetingId: action.meetingId };
    case "CLOSE_PREP_PACK": return { ...state, prepPackMeetingId: "" };
    case "TOGGLE_SHOW_OTHER_MEETINGS": return { ...state, showOtherMeetings: !state.showOtherMeetings };
    case "SET_PM_INSIGHT": {
      const existing = state.pmInsights[action.fundId] ?? { myView: "", pushOn: "", redFlags: "" };
      return { ...state, pmInsights: { ...state.pmInsights, [action.fundId]: { ...existing, [action.field]: action.value } } };
    }
    case "ADD_TO_PACK": {
      if (state.packQueue.some(i => i.id === action.item.id)) return state;
      return { ...state, packQueue: [...state.packQueue, action.item] };
    }
    case "REMOVE_FROM_PACK":
      return { ...state, packQueue: state.packQueue.filter(i => i.id !== action.id) };
    case "REORDER_PACK": {
      const q = [...state.packQueue];
      const [moved] = q.splice(action.fromIndex, 1);
      q.splice(action.toIndex, 0, moved);
      return { ...state, packQueue: q };
    }
    case "CLEAR_PACK":
      return { ...state, packQueue: [] };
    case "SET_SELECTED_CLIENT":
      return { ...state, selectedClientId: action.id };
    case "SET_CLIENT_NOTE":
      return { ...state, clientNotes: { ...state.clientNotes, [action.clientId]: action.note } };
    default: return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
