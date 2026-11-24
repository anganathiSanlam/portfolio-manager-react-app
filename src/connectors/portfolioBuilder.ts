import type { ConnectorMeta } from "./types";

export interface AllocationRow {
  assetClass: string;
  current: number;    // %
  target: number;     // %
  min: number;        // %
  max: number;        // %
}

export interface PortfolioBuilderSuggestion {
  assetClass: string;
  suggested: number;  // %
  pmFinal: number;    // %
  reason: string;
}

export interface FrontierPoint {
  risk: number;         // annualised std dev %
  expectedReturn: number;
  label?: string;
}

export interface PortfolioBuilderData {
  allocations: Record<string, AllocationRow[]>;
  suggestions: Record<string, PortfolioBuilderSuggestion[]>;
  frontier: FrontierPoint[];
  portfolioDots: { name: string; risk: number; expectedReturn: number }[];
  _meta: ConnectorMeta;
}

export async function getPortfolioBuilderData(): Promise<PortfolioBuilderData> {
  return {
    allocations: {
      "Moderate portfolio": [
        { assetClass: "SA Equity",       current: 25, target: 26, min: 20, max: 35 },
        { assetClass: "Global Equity",   current: 22, target: 21, min: 15, max: 30 },
        { assetClass: "EM Equity",       current:  8, target:  8, min:  5, max: 15 },
        { assetClass: "SA Bonds",        current: 18, target: 20, min: 15, max: 30 },
        { assetClass: "Global Bonds",    current:  7, target:  6, min:  0, max: 15 },
        { assetClass: "SA Property",     current:  5, target:  4, min:  0, max: 10 },
        { assetClass: "Infrastructure",  current:  7, target:  8, min:  0, max: 12 },
        { assetClass: "Cash",            current:  8, target:  7, min:  3, max: 15 },
      ],
      "Conservative portfolio": [
        { assetClass: "SA Equity",       current: 15, target: 15, min: 10, max: 25 },
        { assetClass: "Global Equity",   current: 10, target: 10, min:  5, max: 20 },
        { assetClass: "EM Equity",       current:  5, target:  5, min:  0, max: 10 },
        { assetClass: "SA Bonds",        current: 32, target: 33, min: 25, max: 45 },
        { assetClass: "Global Bonds",    current: 10, target:  9, min:  0, max: 20 },
        { assetClass: "SA Property",     current:  5, target:  4, min:  0, max: 10 },
        { assetClass: "Infrastructure",  current:  8, target:  9, min:  0, max: 15 },
        { assetClass: "Cash",            current: 15, target: 15, min:  5, max: 25 },
      ],
      "Aggressive portfolio": [
        { assetClass: "SA Equity",       current: 35, target: 36, min: 25, max: 50 },
        { assetClass: "Global Equity",   current: 30, target: 29, min: 20, max: 40 },
        { assetClass: "EM Equity",       current: 10, target: 10, min:  5, max: 20 },
        { assetClass: "SA Bonds",        current: 10, target: 11, min:  5, max: 20 },
        { assetClass: "Global Bonds",    current:  3, target:  2, min:  0, max: 10 },
        { assetClass: "SA Property",     current:  4, target:  4, min:  0, max: 10 },
        { assetClass: "Infrastructure",  current:  5, target:  5, min:  0, max: 10 },
        { assetClass: "Cash",            current:  3, target:  3, min:  0, max: 10 },
      ],
    },
    suggestions: {
      "Moderate portfolio": [
        { assetClass: "SA Equity", suggested: 28, pmFinal: 26, reason: "PM: prefer to build incrementally; avoid chasing recent outperformance." },
        { assetClass: "SA Bonds", suggested: 22, pmFinal: 20, reason: "PM: comfortable at target; large move needs IC sign-off." },
        { assetClass: "Cash", suggested: 5, pmFinal: 7, reason: "PM: keeping buffer for year-end liquidity needs." },
      ],
      "Conservative portfolio": [
        { assetClass: "SA Bonds", suggested: 36, pmFinal: 33, reason: "PM: mandate cap at 35%; model suggesting above maximum." },
        { assetClass: "Cash", suggested: 12, pmFinal: 15, reason: "PM: client has near-term withdrawal expectation." },
      ],
      "Aggressive portfolio": [
        { assetClass: "SA Equity", suggested: 40, pmFinal: 36, reason: "PM: concentration risk — already overweight vs benchmark." },
        { assetClass: "Global Bonds", suggested: 0, pmFinal: 3, reason: "PM: keeping small hedge against equity drawdown." },
      ],
    },
    frontier: [
      { risk: 3.0,  expectedReturn: 7.4 },
      { risk: 4.2,  expectedReturn: 8.1 },
      { risk: 5.5,  expectedReturn: 8.9 },
      { risk: 7.0,  expectedReturn: 9.6 },
      { risk: 8.8,  expectedReturn: 10.4 },
      { risk: 10.5, expectedReturn: 11.0 },
      { risk: 12.3, expectedReturn: 11.5 },
      { risk: 14.2, expectedReturn: 11.8 },
      { risk: 16.5, expectedReturn: 11.9 },
    ],
    portfolioDots: [
      { name: "Conservative",  risk: 5.5,  expectedReturn: 8.9 },
      { name: "Moderate",      risk: 8.8,  expectedReturn: 10.4 },
      { name: "Aggressive",    risk: 14.2, expectedReturn: 11.8 },
    ],
    _meta: { source: "PortfolioBuilder", asOf: "22 Nov 18:00", simulated: true },
  };
}
