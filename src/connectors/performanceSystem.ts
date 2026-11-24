import type { ConnectorMeta } from "./types";

export interface FundPerformance {
  fundId: string;
  name: string;
  return1M: number;
  return3M: number;
  return1Y: number;
  return3Y: number;
  benchmarkReturn1Y: number;
  excessReturn1Y: number;
  quartileHistory: Array<{ quarter: string; quartile: 1|2|3|4 }>;
  topHoldings: Array<{ name: string; weight: number }>;
  styleDrift: Array<{ date: string; value: number; growth: number }>;
}

export interface PortfolioPerformance {
  portfolioName: string;
  aum: number;
  returnYTD: number;
  returnBenchYTD: number;
  return1Y: number;
  returnBench1Y: number;
  growthSeries: Array<{ month: string; portfolio: number; benchmark: number; target: number }>;
  fees: Array<{ label: string; bps: number }>;
}

export interface PerformanceData {
  funds: Record<string, FundPerformance>;
  portfolios: Record<string, PortfolioPerformance>;
  _meta: ConnectorMeta;
}

export async function getPerformanceData(): Promise<PerformanceData> {
  return {
    funds: {
      northstar: {
        fundId: "northstar", name: "Northstar Global Equity",
        return1M: -1.8, return3M: 2.1, return1Y: 11.4, return3Y: 9.8,
        benchmarkReturn1Y: 13.5, excessReturn1Y: -2.1,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 1 }, { quarter: "Q1 24", quartile: 1 },
          { quarter: "Q2 24", quartile: 2 }, { quarter: "Q3 24", quartile: 2 },
        ],
        topHoldings: [
          { name: "Apple", weight: 8.4 }, { name: "Microsoft", weight: 7.2 },
          { name: "Nvidia", weight: 6.8 }, { name: "Alphabet", weight: 5.1 },
          { name: "Meta", weight: 4.9 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.72, growth: 0.65 },
          { date: "Apr", value: 0.75, growth: 0.68 },
          { date: "Jul", value: 0.80, growth: 0.70 },
          { date: "Oct", value: 0.84, growth: 0.72 },
        ],
      },
      umzi: {
        fundId: "umzi", name: "Umzi Fixed Income",
        return1M: -0.2, return3M: 1.8, return1Y: 10.6, return3Y: 8.4,
        benchmarkReturn1Y: 10.0, excessReturn1Y: 0.6,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 1 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 1 },
        ],
        topHoldings: [
          { name: "SA Govt 2032", weight: 12.4 }, { name: "SA Govt 2030", weight: 10.8 },
          { name: "SA Govt 2035", weight: 9.6 }, { name: "Eskom 2026", weight: 6.1 },
          { name: "SA Govt 2027", weight: 5.9 },
        ],
        styleDrift: [
          { date: "Jan", value: 6.0, growth: 0 },
          { date: "Apr", value: 6.1, growth: 0 },
          { date: "Jul", value: 6.2, growth: 0 },
          { date: "Oct", value: 6.2, growth: 0 },
        ],
      },
      protea: {
        fundId: "protea", name: "Protea SA Equity",
        return1M: 0.4, return3M: 3.2, return1Y: 16.2, return3Y: 11.4,
        benchmarkReturn1Y: 15.0, excessReturn1Y: 1.2,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 1 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 1 },
        ],
        topHoldings: [
          { name: "Standard Bank", weight: 9.2 }, { name: "Naspers", weight: 8.1 },
          { name: "Anglo American", weight: 7.4 }, { name: "Firstrand", weight: 6.8 },
          { name: "Bidcorp", weight: 6.1 },
        ],
        styleDrift: [
          { date: "Jan", value: -0.4, growth: -0.3 },
          { date: "Apr", value: -0.4, growth: -0.3 },
          { date: "Jul", value: -0.3, growth: -0.2 },
          { date: "Oct", value: -0.3, growth: -0.2 },
        ],
      },
    },
    portfolios: {
      "Moderate portfolio": {
        portfolioName: "Moderate portfolio", aum: 4820,
        returnYTD: 10.8, returnBenchYTD: 10.1,
        return1Y: 10.8, returnBench1Y: 10.1,
        growthSeries: [
          { month: "Nov 23", portfolio: 100, benchmark: 100, target: 100 },
          { month: "Jan 24", portfolio: 101.4, benchmark: 100.9, target: 101.0 },
          { month: "Mar 24", portfolio: 102.9, benchmark: 102.1, target: 102.1 },
          { month: "May 24", portfolio: 104.1, benchmark: 103.4, target: 103.1 },
          { month: "Jul 24", portfolio: 105.8, benchmark: 104.9, target: 104.2 },
          { month: "Sep 24", portfolio: 107.2, benchmark: 106.1, target: 105.3 },
          { month: "Nov 24", portfolio: 108.4, benchmark: 107.9, target: 106.4 },
        ],
        fees: [
          { label: "Manager fees",    bps: 62 },
          { label: "Platform fee",    bps: 15 },
          { label: "Admin & custody", bps: 8  },
          { label: "Advisory fee",    bps: 25 },
        ],
      },
      "Conservative portfolio": {
        portfolioName: "Conservative portfolio", aum: 2160,
        returnYTD: 9.1, returnBenchYTD: 8.8,
        return1Y: 9.1, returnBench1Y: 8.8,
        growthSeries: [
          { month: "Nov 23", portfolio: 100, benchmark: 100, target: 100 },
          { month: "Jan 24", portfolio: 101.0, benchmark: 100.7, target: 100.9 },
          { month: "Mar 24", portfolio: 102.1, benchmark: 101.5, target: 101.8 },
          { month: "May 24", portfolio: 103.2, benchmark: 102.4, target: 102.7 },
          { month: "Jul 24", portfolio: 104.5, benchmark: 103.6, target: 103.6 },
          { month: "Sep 24", portfolio: 105.8, benchmark: 104.9, target: 104.5 },
          { month: "Nov 24", portfolio: 106.1, benchmark: 105.8, target: 105.4 },
        ],
        fees: [
          { label: "Manager fees",    bps: 48 },
          { label: "Platform fee",    bps: 15 },
          { label: "Admin & custody", bps: 8  },
          { label: "Advisory fee",    bps: 25 },
        ],
      },
      "Aggressive portfolio": {
        portfolioName: "Aggressive portfolio", aum: 1430,
        returnYTD: 13.2, returnBenchYTD: 12.4,
        return1Y: 13.2, returnBench1Y: 12.4,
        growthSeries: [
          { month: "Nov 23", portfolio: 100, benchmark: 100, target: 100 },
          { month: "Jan 24", portfolio: 102.0, benchmark: 101.2, target: 101.2 },
          { month: "Mar 24", portfolio: 104.1, benchmark: 103.0, target: 102.4 },
          { month: "May 24", portfolio: 106.2, benchmark: 104.9, target: 103.6 },
          { month: "Jul 24", portfolio: 108.6, benchmark: 107.1, target: 104.8 },
          { month: "Sep 24", portfolio: 110.1, benchmark: 108.8, target: 106.0 },
          { month: "Nov 24", portfolio: 111.1, benchmark: 110.2, target: 107.2 },
        ],
        fees: [
          { label: "Manager fees",    bps: 74 },
          { label: "Platform fee",    bps: 15 },
          { label: "Admin & custody", bps: 8  },
          { label: "Advisory fee",    bps: 25 },
        ],
      },
    },
    _meta: { source: "Performance System", asOf: "22 Nov 17:30", simulated: true },
  };
}
