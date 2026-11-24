import type { ConnectorMeta } from "./types";

export interface IMFForecast {
  region: string;
  growth2024: number; growth2025: number; growth2026: number;
  inflation2024: number; inflation2025: number; inflation2026: number;
}

export interface PMIEntry {
  country: string;
  values: number[];  // 6 months oldest-first
}

export interface IMFData {
  forecasts: IMFForecast[];
  pmiMonths: string[];
  pmiData: PMIEntry[];
  _meta: ConnectorMeta;
}

export async function getIMFData(): Promise<IMFData> {
  return {
    forecasts: [
      { region: "World",         growth2024: 3.2, growth2025: 3.3, growth2026: 3.3, inflation2024: 5.8, inflation2025: 4.3, inflation2026: 3.5 },
      { region: "Advanced",      growth2024: 1.8, growth2025: 1.9, growth2026: 2.0, inflation2024: 3.1, inflation2025: 2.4, inflation2026: 2.1 },
      { region: "United States", growth2024: 2.8, growth2025: 2.4, growth2026: 2.1, inflation2024: 3.4, inflation2025: 2.7, inflation2026: 2.3 },
      { region: "Eurozone",      growth2024: 0.8, growth2025: 1.1, growth2026: 1.4, inflation2024: 2.6, inflation2025: 2.1, inflation2026: 1.9 },
      { region: "UK",            growth2024: 1.0, growth2025: 1.3, growth2026: 1.5, inflation2024: 2.8, inflation2025: 2.3, inflation2026: 2.0 },
      { region: "China",         growth2024: 4.8, growth2025: 4.5, growth2026: 4.3, inflation2024: 0.4, inflation2025: 1.0, inflation2026: 1.3 },
      { region: "EM ex-China",   growth2024: 4.1, growth2025: 4.2, growth2026: 4.3, inflation2024: 7.4, inflation2025: 5.8, inflation2026: 4.9 },
      { region: "South Africa",  growth2024: 1.1, growth2025: 1.4, growth2026: 1.8, inflation2024: 4.5, inflation2025: 3.8, inflation2026: 4.0 },
    ],
    pmiMonths: ["May '26", "Jun '26", "Jul '26", "Aug '26", "Sep '26", "Oct '26"],
    pmiData: [
      { country: "US",       values: [51.3, 51.8, 52.4, 51.9, 52.1, 51.6] },
      { country: "Eurozone", values: [48.4, 48.9, 49.3, 49.8, 50.2, 50.5] },
      { country: "UK",       values: [50.1, 50.4, 51.1, 50.8, 51.3, 51.9] },
      { country: "China",    values: [50.8, 51.0, 50.4, 49.8, 50.1, 50.6] },
      { country: "Japan",    values: [50.3, 50.6, 51.2, 50.9, 51.4, 51.8] },
      { country: "India",    values: [57.3, 58.1, 57.8, 58.4, 57.9, 58.6] },
      { country: "SA",       values: [49.2, 49.8, 50.1, 50.5, 51.0, 51.3] },
      { country: "Brazil",   values: [51.1, 51.4, 50.9, 51.3, 51.8, 52.1] },
    ],
    _meta: { source: "IMF", asOf: "Oct 2026", simulated: true },
  };
}
