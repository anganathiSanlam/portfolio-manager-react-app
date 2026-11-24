import type { ConnectorMeta } from "./types";

export interface ThemeChartPoint { label: string; value: number; }

export interface ThemeCard {
  id: string;
  title: string;
  narrative: string;
  chartData: ThemeChartPoint[];
  chartLabel: string;
  chartUnit: string;
  source: string;
  tags: string[];
}

export interface BCAData {
  themes: ThemeCard[];
  _meta: ConnectorMeta;
}

export async function getBCAData(): Promise<BCAData> {
  return {
    themes: [
      {
        id: "ai-supply-chain",
        title: "AI supply chain buildout",
        narrative: "Capital expenditure on AI infrastructure continues to accelerate, with Nvidia, TSMC and hyperscalers driving significant semiconductor demand. MSCI World IT sector earnings revisions remain positive. The read-through for DM equity exposure is supportive.",
        chartData: [
          { label: "Q1 '25", value: 48 }, { label: "Q2 '25", value: 55 }, { label: "Q3 '25", value: 61 },
          { label: "Q4 '25", value: 68 }, { label: "Q1 '26", value: 74 }, { label: "Q2 '26", value: 82 },
          { label: "Q3 '26", value: 89 }, { label: "Q4 '26E", value: 96 },
        ],
        chartLabel: "Global AI capex (index, Q1 2025 = 100)",
        chartUnit: "Index",
        source: "BCA Research / Bloomberg",
        tags: ["DM Equity", "Technology"],
      },
      {
        id: "us-rate-trajectory",
        title: "US rates — holding, not hiking",
        narrative: "The Fed held at 4.5% at the November FOMC meeting. Market pricing has shifted hawkish with just two cuts priced over the next 12 months. Elevated for longer means continued multiple pressure on growth stocks. Favour value and dividend strategies.",
        chartData: [
          { label: "Jan '25", value: 4.75 }, { label: "Mar '25", value: 4.5 }, { label: "Jun '25", value: 4.5 },
          { label: "Sep '25", value: 4.5  }, { label: "Dec '25", value: 4.5 }, { label: "Mar '26", value: 4.25 },
          { label: "Jun '26", value: 4.25 }, { label: "Oct '26", value: 4.5  },
        ],
        chartLabel: "US Fed Funds rate (%)",
        chartUnit: "%",
        source: "Federal Reserve / Bloomberg",
        tags: ["Global Bonds", "DM Equity"],
      },
      {
        id: "china-etf-buying",
        title: "China ETF buying resurgence",
        narrative: "The PBOC and state funds have been buying domestic equity ETFs to stabilise the CSI 300. 1-month flows into China-focused ETFs reached a 3-year high. Valuations remain cheap (11x PE) but earnings visibility is low. Tactically neutral, monitoring for upgrade.",
        chartData: [
          { label: "May '26", value: 2.1 }, { label: "Jun '26", value: 1.8 }, { label: "Jul '26", value: 2.4 },
          { label: "Aug '26", value: 3.2 }, { label: "Sep '26", value: 4.1 }, { label: "Oct '26", value: 5.8 },
        ],
        chartLabel: "China ETF net inflows (USD bn, monthly)",
        chartUnit: "USD bn",
        source: "BCA Research / Bloomberg",
        tags: ["EM Equity", "China"],
      },
      {
        id: "sa-rate-cycle",
        title: "SA cutting cycle — third cut delivered",
        narrative: "The SARB cut 25bp to 7.75% in November — the third consecutive cut. CPI is at 3.8%, well below the 4.5% midpoint. The real repo rate remains restrictive at ~3.95%. Duration in SA bonds is rewarded; we retain the strong overweight.",
        chartData: [
          { label: "May '25", value: 8.25 }, { label: "Jul '25", value: 8.25 }, { label: "Sep '25", value: 8.0  },
          { label: "Nov '25", value: 7.75 }, { label: "Jan '26", value: 7.75 }, { label: "May '26", value: 7.5  },
          { label: "Sep '26", value: 7.5  }, { label: "Nov '26", value: 7.75 },
        ],
        chartLabel: "SA repo rate (%)",
        chartUnit: "%",
        source: "SARB / SIMM Internal",
        tags: ["SA Bonds", "SA Equity"],
      },
    ],
    _meta: { source: "BCA Research", asOf: "23 Nov 2026", simulated: true },
  };
}
