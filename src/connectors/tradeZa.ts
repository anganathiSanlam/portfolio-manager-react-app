import type { ConnectorMeta } from "./types";

export interface ClientOutcomeRow {
  clientId: string;
  clientName: string;
  portfolio: string;
  goalLabel: string;
  targetReturn: number;   // % p.a.
  actualReturn: number;   // % p.a. (trailing 1Y)
  onTrack: boolean;
  investedSince: string;
  currentValue: number;   // Rm
  targetValue: number;    // Rm (by goal date)
  goalDate: string;
  growthSeries: { year: string; actual: number; target: number }[];
}

export interface TradeZaData {
  clientOutcomes: ClientOutcomeRow[];
  _meta: ConnectorMeta;
}

export async function getTradeZaData(): Promise<TradeZaData> {
  return {
    clientOutcomes: [
      {
        clientId: "c001", clientName: "Themba Nkosi", portfolio: "Moderate portfolio",
        goalLabel: "Retirement at 65", targetReturn: 10.0, actualReturn: 10.8, onTrack: true,
        investedSince: "2019-03-01", currentValue: 4.82, targetValue: 7.5, goalDate: "2031-03-01",
        growthSeries: [
          { year: "2019", actual: 1.00, target: 1.00 }, { year: "2020", actual: 0.95, target: 1.10 },
          { year: "2021", actual: 1.18, target: 1.21 }, { year: "2022", actual: 1.09, target: 1.33 },
          { year: "2023", actual: 1.28, target: 1.46 }, { year: "2024", actual: 1.42, target: 1.61 },
        ],
      },
      {
        clientId: "c002", clientName: "Liezel du Plessis", portfolio: "Conservative portfolio",
        goalLabel: "Education fund 2028", targetReturn: 8.5, actualReturn: 9.1, onTrack: true,
        investedSince: "2020-01-01", currentValue: 2.16, targetValue: 3.2, goalDate: "2028-01-01",
        growthSeries: [
          { year: "2020", actual: 1.00, target: 1.00 }, { year: "2021", actual: 1.12, target: 1.085 },
          { year: "2022", actual: 1.08, target: 1.17 }, { year: "2023", actual: 1.19, target: 1.27 },
          { year: "2024", actual: 1.33, target: 1.38 },
        ],
      },
      {
        clientId: "c003", clientName: "Ruan Steenkamp", portfolio: "Aggressive portfolio",
        goalLabel: "Wealth accumulation", targetReturn: 13.0, actualReturn: 13.2, onTrack: true,
        investedSince: "2021-06-01", currentValue: 1.43, targetValue: 2.8, goalDate: "2031-06-01",
        growthSeries: [
          { year: "2021", actual: 1.00, target: 1.00 }, { year: "2022", actual: 0.91, target: 1.13 },
          { year: "2023", actual: 1.08, target: 1.28 }, { year: "2024", actual: 1.25, target: 1.44 },
        ],
      },
    ],
    _meta: { source: "Trade ZA", asOf: "22 Nov 16:00", simulated: true },
  };
}
