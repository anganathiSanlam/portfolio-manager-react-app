import type { ConnectorMeta } from "./types";

export type Quartile = 1 | 2 | 3 | 4;

export interface FundScreenRow {
  id: string;
  name: string;
  assetClass: string;
  asisa: string;
  style: string;
  fee: number;         // %
  currentQuartile: Quartile;
  consistencyScore: number; // 0–100
  persistencyScore: number; // 0–100
  quarterlyQuartiles: Quartile[]; // 12 quarters, oldest first
}

export interface HouseViewRow {
  assetClass: string;
  expectedReturn: number; // %
  hurdleRate: number;     // %
  view: number;           // -2 to +2
  reason: string;
  macro: string;
  allocationChange: string;
  sourceRefs: string[];
}

export interface TAARow {
  assetClass: string;
  currentMin: number;      // current positioning, -2 to +2
  currentMax: number;
  forwardView: number;     // 6–12 month view, triangle marker on -2 to +2
  historicalReturns: Record<string, number>;   // year → annual return %
  oneYearReturn: number;   // 1Y to Oct 2026
}

export interface AlphaBetaData {
  funds: FundScreenRow[];
  houseView: HouseViewRow[];
  taaPositioning: TAARow[];
  _meta: ConnectorMeta;
}

export async function getAlphaBetaData(): Promise<AlphaBetaData> {
  return {
    funds: [
      { id: "northstar", name: "Northstar Global Equity", assetClass: "Global Equity", asisa: "Global Equity General", style: "Quality Growth", fee: 1.00, currentQuartile: 2, consistencyScore: 71, persistencyScore: 68, quarterlyQuartiles: [1,1,2,1,2,2,1,2,2,3,2,2] },
      { id: "umzi", name: "Umzi Fixed Income", assetClass: "SA Bonds", asisa: "SA Interest Bearing Variable Term", style: "Active Duration", fee: 0.45, currentQuartile: 1, consistencyScore: 85, persistencyScore: 80, quarterlyQuartiles: [2,1,1,1,1,2,1,1,1,1,2,1] },
      { id: "protea", name: "Protea SA Equity", assetClass: "SA Equity", asisa: "SA Equity General", style: "Value", fee: 0.80, currentQuartile: 1, consistencyScore: 78, persistencyScore: 74, quarterlyQuartiles: [3,2,1,2,1,1,2,1,1,1,1,1] },
      { id: "global-index", name: "Global Equity Index", assetClass: "Global Equity", asisa: "Global Equity General", style: "Passive", fee: 0.20, currentQuartile: 2, consistencyScore: 90, persistencyScore: 88, quarterlyQuartiles: [2,2,2,2,2,2,2,2,2,2,2,2] },
      { id: "cedar", name: "Cedar Infrastructure", assetClass: "Infrastructure", asisa: "SA Real Assets", style: "Infrastructure", fee: 1.20, currentQuartile: 1, consistencyScore: 82, persistencyScore: 76, quarterlyQuartiles: [2,1,1,1,2,1,1,1,1,1,1,1] },
      { id: "baobab", name: "Baobab SA Property", assetClass: "SA Property", asisa: "SA Real Estate", style: "Core", fee: 0.65, currentQuartile: 3, consistencyScore: 54, persistencyScore: 48, quarterlyQuartiles: [1,2,2,3,3,4,3,3,3,4,3,3] },
      { id: "atlas", name: "Atlas EM Equity", assetClass: "EM Equity", asisa: "Global Equity EM", style: "Blend", fee: 0.90, currentQuartile: 2, consistencyScore: 63, persistencyScore: 61, quarterlyQuartiles: [3,2,2,2,2,1,2,2,3,2,2,2] },
      { id: "harness", name: "Harness SA Cash", assetClass: "Cash", asisa: "SA Interest Bearing Short Term", style: "Active Cash", fee: 0.18, currentQuartile: 1, consistencyScore: 92, persistencyScore: 91, quarterlyQuartiles: [1,1,1,1,1,1,1,2,1,1,1,1] },
      { id: "ridge", name: "Ridge Global Bonds", assetClass: "Global Bonds", asisa: "Global Interest Bearing", style: "Duration", fee: 0.55, currentQuartile: 2, consistencyScore: 67, persistencyScore: 65, quarterlyQuartiles: [2,3,2,2,3,2,2,2,2,2,2,2] },
      { id: "falcon", name: "Falcon SA Equity", assetClass: "SA Equity", asisa: "SA Equity General", style: "Growth", fee: 0.95, currentQuartile: 3, consistencyScore: 48, persistencyScore: 44, quarterlyQuartiles: [2,2,3,3,4,3,3,3,4,3,3,3] },
      { id: "moss", name: "Moss SA Multi-Asset", assetClass: "Multi-Asset", asisa: "SA Multi Asset High Equity", style: "Balanced", fee: 0.70, currentQuartile: 2, consistencyScore: 72, persistencyScore: 70, quarterlyQuartiles: [2,2,1,2,2,2,2,1,2,2,2,2] },
      { id: "dune", name: "Dune Global Multi-Asset", assetClass: "Multi-Asset", asisa: "Global Multi Asset High Equity", style: "Tactical", fee: 1.10, currentQuartile: 1, consistencyScore: 80, persistencyScore: 77, quarterlyQuartiles: [1,2,1,1,2,1,1,1,2,1,1,1] },
      { id: "spring", name: "Spring SA Bonds", assetClass: "SA Bonds", asisa: "SA Interest Bearing Variable Term", style: "Passive Duration", fee: 0.15, currentQuartile: 2, consistencyScore: 88, persistencyScore: 86, quarterlyQuartiles: [2,2,2,2,2,2,2,2,2,2,2,2] },
      { id: "peak", name: "Peak US Equity", assetClass: "Global Equity", asisa: "Global Equity General", style: "Market Cap", fee: 0.25, currentQuartile: 1, consistencyScore: 86, persistencyScore: 85, quarterlyQuartiles: [1,1,1,2,1,1,1,1,1,1,1,1] },
      { id: "clay", name: "Clay SA Value", assetClass: "SA Equity", asisa: "SA Equity General", style: "Deep Value", fee: 0.85, currentQuartile: 4, consistencyScore: 35, persistencyScore: 32, quarterlyQuartiles: [2,3,3,4,4,3,4,4,4,4,4,4] },
    ],
    houseView: [
      { assetClass: "SA Equity", expectedReturn: 13.5, hurdleRate: 12.0, view: 1, reason: "Cheap on PE; rand tailwind from rate cuts expected.", macro: "SA repo cutting cycle supports consumer spending and earnings re-rating.", allocationChange: "+1pp overweight", sourceRefs: ["Trading Economics — SA repo", "AlphaBeta"] },
      { assetClass: "Global Equity", expectedReturn: 10.2, hurdleRate: 11.5, view: -1, reason: "Expensive on CAPE; concentration risk in US mega-cap.", macro: "Fed holding at 4.5% — multiple compression risk remains.", allocationChange: "−1pp underweight", sourceRefs: ["Trading Economics — US Fed", "AlphaBeta"] },
      { assetClass: "EM Equity", expectedReturn: 11.8, hurdleRate: 12.0, view: 0, reason: "Neutral — China uncertainty offsets EM value.", macro: "USD weakening modestly supportive for EM.", allocationChange: "Neutral", sourceRefs: ["Trading Economics", "AlphaBeta"] },
      { assetClass: "SA Bonds", expectedReturn: 10.8, hurdleRate: 9.5, view: 2, reason: "Real yield highly attractive; cutting cycle intact.", macro: "SA inflation at 3.8%, well inside band. Duration rewarded.", allocationChange: "+2pp overweight", sourceRefs: ["Trading Economics — SA repo, SA CPI", "AlphaBeta"] },
      { assetClass: "Global Bonds", expectedReturn: 5.1, hurdleRate: 6.5, view: -1, reason: "Duration risk elevated; Fed not cutting fast enough.", macro: "US CPI at 2.1% — just above target. Fed cautious.", allocationChange: "−1pp underweight", sourceRefs: ["Trading Economics — US Fed, US CPI"] },
      { assetClass: "SA Property", expectedReturn: 8.4, hurdleRate: 10.0, view: -1, reason: "Structural vacancy headwinds in office and retail.", macro: "Rate cuts help valuations but income growth muted.", allocationChange: "Neutral to slight underweight", sourceRefs: ["AlphaBeta", "Trade ZA"] },
      { assetClass: "Infrastructure", expectedReturn: 11.2, hurdleRate: 10.0, view: 1, reason: "Inflation-linked cash flows; electricity build-out theme.", macro: "Long-dated real rates falling — favours infrastructure duration.", allocationChange: "+1pp overweight", sourceRefs: ["Trading Economics — SA bond", "AlphaBeta"] },
      { assetClass: "Cash", expectedReturn: 7.9, hurdleRate: 7.75, view: 0, reason: "Attractive short-term but repo heading lower — trim over 12m.", macro: "SA repo 7.75% — real return positive but expected to decline.", allocationChange: "Neutral — trim on rate cuts", sourceRefs: ["Trading Economics — SA repo"] },
    ],
    taaPositioning: [
      { assetClass: "DM Equity",             currentMin: -1.0, currentMax:  0.0, forwardView: -0.5, historicalReturns: { "2018": -6.5,  "2019": 24.8, "2020": 15.1, "2021": 20.4, "2022": -18.2, "2023": 23.1, "2024": 21.5, "2025": 12.3 }, oneYearReturn: 15.8 },
      { assetClass: "EM Equity",             currentMin: -0.5, currentMax:  0.5, forwardView:  0.5, historicalReturns: { "2018": -14.6, "2019": 18.4, "2020": 18.3, "2021": -2.5, "2022": -20.0, "2023":  9.8, "2024":  6.5, "2025":  7.2 }, oneYearReturn:  8.4 },
      { assetClass: "Global Bonds",          currentMin: -1.5, currentMax: -0.5, forwardView: -1.0, historicalReturns: { "2018": -2.2,  "2019":  7.5, "2020":  9.1, "2021": -1.5, "2022": -16.4, "2023":  5.5, "2024":  3.8, "2025":  2.9 }, oneYearReturn:  4.1 },
      { assetClass: "Global ILB",            currentMin: -0.5, currentMax:  0.5, forwardView:  0.0, historicalReturns: { "2018": -4.3,  "2019":  8.4, "2020": 11.2, "2021":  5.2, "2022": -19.8, "2023":  8.3, "2024":  2.1, "2025":  3.4 }, oneYearReturn:  5.2 },
      { assetClass: "Global Infrastructure", currentMin:  0.5, currentMax:  1.5, forwardView:  1.0, historicalReturns: { "2018": -4.0,  "2019": 23.2, "2020":  7.9, "2021": 15.4, "2022":  -7.2, "2023":  6.8, "2024": 10.5, "2025":  8.1 }, oneYearReturn:  9.3 },
      { assetClass: "Global Property",       currentMin: -1.0, currentMax:  0.0, forwardView: -0.5, historicalReturns: { "2018": -6.0,  "2019": 23.1, "2020": -6.3, "2021": 24.8, "2022": -24.1, "2023":  9.4, "2024":  4.7, "2025":  6.2 }, oneYearReturn:  7.8 },
      { assetClass: "Global Cash",           currentMin: -0.5, currentMax:  0.5, forwardView:  0.3, historicalReturns: { "2018":  1.8,  "2019":  2.4, "2020":  0.9, "2021":  0.4, "2022":   2.2, "2023":  5.4, "2024":  5.1, "2025":  4.8 }, oneYearReturn:  4.5 },
    ],
    _meta: { source: "AlphaBeta", asOf: "22 Nov 18:00", simulated: true },
  };
}
