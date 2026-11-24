import type { ConnectorMeta } from "./types";

export interface MacroIndicator {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;       // change vs last week
  changeLabel: string;
  trend: number[];      // last 8 weekly readings
  targetLine?: number;
  region: "SA" | "US" | "Global";
}

export interface MacroData {
  indicators: MacroIndicator[];
  inflationSeries: { month: string; saActual: number; usActual: number; saTarget: number; usTarget: number }[];
  _meta: ConnectorMeta;
}

const INFLATION_SERIES = [
  { month: "Apr", saActual: 5.2, usActual: 3.5, saTarget: 4.5, usTarget: 2.0 },
  { month: "May", saActual: 5.1, usActual: 3.3, saTarget: 4.5, usTarget: 2.0 },
  { month: "Jun", saActual: 4.9, usActual: 3.0, saTarget: 4.5, usTarget: 2.0 },
  { month: "Jul", saActual: 4.6, usActual: 2.9, saTarget: 4.5, usTarget: 2.0 },
  { month: "Aug", saActual: 4.4, usActual: 2.7, saTarget: 4.5, usTarget: 2.0 },
  { month: "Sep", saActual: 4.1, usActual: 2.5, saTarget: 4.5, usTarget: 2.0 },
  { month: "Oct", saActual: 3.9, usActual: 2.3, saTarget: 4.5, usTarget: 2.0 },
  { month: "Nov", saActual: 3.8, usActual: 2.1, saTarget: 4.5, usTarget: 2.0 },
];

export async function getMacroData(): Promise<MacroData> {
  return {
    indicators: [
      { id: "us-fed", label: "US Fed funds", value: 4.5, unit: "%", change: 0, changeLabel: "Unchanged", trend: [5.5, 5.5, 5.25, 5.0, 4.75, 4.75, 4.5, 4.5], region: "US" },
      { id: "us-cpi", label: "US inflation", value: 2.1, unit: "%", change: -0.2, changeLabel: "−0.2pp", trend: [3.5, 3.3, 3.0, 2.9, 2.7, 2.5, 2.3, 2.1], targetLine: 2.0, region: "US" },
      { id: "sa-repo", label: "SA repo rate", value: 7.75, unit: "%", change: -0.25, changeLabel: "−25bp", trend: [8.5, 8.5, 8.25, 8.25, 8.0, 8.0, 7.75, 7.75], region: "SA" },
      { id: "sa-cpi", label: "SA inflation", value: 3.8, unit: "%", change: -0.1, changeLabel: "−0.1pp", trend: [5.2, 5.1, 4.9, 4.6, 4.4, 4.1, 3.9, 3.8], targetLine: 4.5, region: "SA" },
      { id: "usdzar", label: "USD/ZAR", value: 18.24, unit: "", change: -0.18, changeLabel: "−0.18", trend: [19.1, 18.9, 18.8, 18.6, 18.5, 18.4, 18.4, 18.24], region: "Global" },
      { id: "sa-bond", label: "SA 10y yield", value: 9.85, unit: "%", change: -0.12, changeLabel: "−12bp", trend: [10.8, 10.6, 10.5, 10.3, 10.2, 10.1, 9.97, 9.85], region: "SA" },
      { id: "oil", label: "Brent crude", value: 72.4, unit: "$/bbl", change: -1.8, changeLabel: "−$1.8", trend: [84, 82, 80, 79, 76, 74, 73, 72.4], region: "Global" },
    ],
    inflationSeries: INFLATION_SERIES,
    _meta: { source: "Trading Economics", asOf: "23 Nov 08:00", simulated: true },
  };
}
