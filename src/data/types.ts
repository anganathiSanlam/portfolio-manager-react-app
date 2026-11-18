export interface NavItem {
  id: string;
  number: string;
  label: string;
  alert?: boolean;
}

export interface Portfolio {
  name: string;
  meta: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  category: string;
  portfolio: string;
  description: string;
}

export interface Fund {
  id: string;
  name: string;
  role: string;
  weight: string;
  excess: string;
  excessValue: number;
  fee: string;
  rating: string;
  reviewStatus: string;
  reviewDate: string;
  reviewSummary: string;
  returnSummary: string;
  roleSummary: string;
  driftSummary: string;
  volatility: string;
  worstFall: string;
  topHolding: string;
  sector: string;
  overlap: string;
  size: string;
  team: string;
  manager: string;
}

export interface Manager {
  id: string;
  name: string;
  fund: string;
  role: string;
  assets: string;
  rating: string;
  review: string;
  approved: boolean;
  manager: string;
}

export interface DemoRole {
  name: string;
  description: string;
}

export interface PageDataEntry {
  eyebrow?: string;
  title: string;
  subtitle: string;
  metrics?: [string, string, string][];
  insight?: [string, string, string, string];
  tableTitle?: string;
  columns?: string[];
  rows?: string[][];
  listTitle?: string;
  list?: string[][];
}

export interface NoteVersion {
  label: string;
  title: string;
  talkingPoints: string[];
  meetingRecord: string;
  actionItems: string[];
}

export interface NoteRecord {
  id: string;
  label: string;
  date: string;
  title: string;
  context: string;
  status: string;
  finalised: boolean;
  shared: boolean;
  talkingPoints: string[];
  meetingRecord: string;
  actionItems: string[];
  versions: NoteVersion[];
}

export interface AuditRecord {
  time: string;
  event: string;
  proposedBy: string;
  approver: string;
  status: string;
  type: string;
  proposal: string;
}

export interface RiskProfile {
  shares: number;
  target: number;
  band: string;
  cash: number;
  liquidity: number;
  liquidDays: number;
}
