import type { ConnectorMeta } from "./types";

export type MeetingType = "manager" | "aa-meeting" | "client" | "other";
export type PrepStatus  = "ready" | "needs-input" | "not-started";

export interface OutlookMeeting {
  id: string;
  title: string;
  start: string;        // ISO datetime
  end: string;
  location: string;
  isTeams: boolean;
  attendees: string[];
  type: MeetingType;
  linkedManagerId?: string;
  linkedClientId?: string;
}

export interface OutlookData {
  meetings: OutlookMeeting[];
  _meta: ConnectorMeta;
}

export async function getOutlookMeetings(): Promise<OutlookData> {
  return {
    meetings: [
      {
        id: "meet-001",
        title: "Northstar Global Equity — Quarterly Review",
        start: "2026-11-26T11:00:00",
        end:   "2026-11-26T12:00:00",
        location: "Microsoft Teams",
        isTeams: true,
        attendees: ["PM · Luyolo", "James Olivier (Northstar)", "Sarah van der Berg"],
        type: "manager",
        linkedManagerId: "northstar",
      },
      {
        id: "meet-002",
        title: "Umzi Fixed Income — Fee Negotiation",
        start: "2026-12-01T10:00:00",
        end:   "2026-12-01T11:00:00",
        location: "21 Dreyer St, Claremont",
        isTeams: false,
        attendees: ["PM · Luyolo", "Thabo Dlamini (Umzi)", "Legal — Nadia Koen"],
        type: "manager",
        linkedManagerId: "umzi",
      },
      {
        id: "meet-003",
        title: "Protea SA Equity — Annual Review",
        start: "2026-12-05T14:00:00",
        end:   "2026-12-05T15:30:00",
        location: "Microsoft Teams",
        isTeams: true,
        attendees: ["PM · Luyolo", "Nomvula Khumalo (Protea)", "Risk — Ruan Botha"],
        type: "manager",
        linkedManagerId: "protea",
      },
      {
        id: "meet-004",
        title: "December Asset Allocation Meeting",
        start: "2026-11-27T09:00:00",
        end:   "2026-11-27T11:00:00",
        location: "Board Room 3",
        isTeams: false,
        attendees: ["PM · Luyolo", "CIO", "Macro team", "Rates team"],
        type: "aa-meeting",
      },
      {
        id: "meet-005",
        title: "Client Review — Momentum Corporate",
        start: "2026-11-28T14:00:00",
        end:   "2026-11-28T15:00:00",
        location: "Microsoft Teams",
        isTeams: true,
        attendees: ["PM · Luyolo", "Client adviser — Brendan Steyn", "Client rep"],
        type: "client",
        linkedClientId: "momentum-corporate",
      },
      {
        id: "meet-006",
        title: "Client Onboarding — Cape Pension Fund",
        start: "2026-12-03T10:00:00",
        end:   "2026-12-03T11:30:00",
        location: "55 Wale St, Cape Town",
        isTeams: false,
        attendees: ["PM · Luyolo", "Sales — Cindy Nkosi", "Trustees × 3"],
        type: "client",
        linkedClientId: "cape-pension",
      },
      {
        id: "meet-007",
        title: "IC Prep — December Pack Sign-off",
        start: "2026-11-25T08:30:00",
        end:   "2026-11-25T09:30:00",
        location: "Board Room 1",
        isTeams: false,
        attendees: ["PM · Luyolo", "CIO", "Head of Research"],
        type: "other",
      },
      {
        id: "meet-008",
        title: "Team Weekly Stand-up",
        start: "2026-11-25T16:00:00",
        end:   "2026-11-25T16:30:00",
        location: "Microsoft Teams",
        isTeams: true,
        attendees: ["Full investment team"],
        type: "other",
      },
    ],
    _meta: { source: "Outlook", asOf: "24 Nov 08:00", simulated: true },
  };
}
