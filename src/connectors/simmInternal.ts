import type { ConnectorMeta } from "./types";

export interface SimmData {
  saRepo: number;
  saCPI: number;
  usdZar: number;
  saGrowthLatest: number;
  mtbpsDeficitGDP: number;
  mtbpsDebtGDP: number;
  mtbpsNote: string;
  _meta: ConnectorMeta;
}

export async function getSimmData(): Promise<SimmData> {
  return {
    saRepo: 7.75,
    saCPI: 3.8,
    usdZar: 18.24,
    saGrowthLatest: 1.4,
    mtbpsDeficitGDP: -4.7,
    mtbpsDebtGDP: 73.1,
    mtbpsNote: "MTBPS Nov 2026: Deficit revised slightly narrower to 4.7% of GDP. Debt/GDP at 73.1%, stabilising. Revenue surprise from mining royalties. Expenditure ceiling maintained.",
    _meta: { source: "SIMM Internal", asOf: "23 Nov 2026", simulated: true },
  };
}
