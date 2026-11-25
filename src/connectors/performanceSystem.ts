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
      "global-index": {
        fundId: "global-index", name: "Global Equity Index",
        return1M: 1.2, return3M: 3.4, return1Y: 13.4, return3Y: 10.2,
        benchmarkReturn1Y: 13.5, excessReturn1Y: -0.1,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 2 },
          { quarter: "Q2 24", quartile: 2 }, { quarter: "Q3 24", quartile: 2 },
        ],
        topHoldings: [
          { name: "Apple", weight: 6.8 }, { name: "Microsoft", weight: 6.1 },
          { name: "Nvidia", weight: 5.9 }, { name: "Amazon", weight: 4.4 },
          { name: "Meta", weight: 3.8 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.02, growth: 0.01 }, { date: "Apr", value: 0.01, growth: 0.01 },
          { date: "Jul", value: 0.02, growth: 0.02 }, { date: "Oct", value: 0.01, growth: 0.01 },
        ],
      },
      cedar: {
        fundId: "cedar", name: "Cedar Infrastructure",
        return1M: 0.8, return3M: 2.4, return1Y: 12.1, return3Y: 9.8,
        benchmarkReturn1Y: 10.9, excessReturn1Y: 1.2,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 1 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 1 },
        ],
        topHoldings: [
          { name: "N3 Toll Concession", weight: 11.4 }, { name: "ACSA Bonds 2028", weight: 9.8 },
          { name: "Transnet Bonds 2030", weight: 8.6 }, { name: "SA Power Fund", weight: 7.9 },
          { name: "Prasa Rail Bonds", weight: 6.2 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.5, growth: 0.6 }, { date: "Apr", value: 0.5, growth: 0.6 },
          { date: "Jul", value: 0.6, growth: 0.6 }, { date: "Oct", value: 0.6, growth: 0.7 },
        ],
      },
      baobab: {
        fundId: "baobab", name: "Baobab SA Property",
        return1M: -0.6, return3M: -1.8, return1Y: 5.2, return3Y: 3.1,
        benchmarkReturn1Y: 7.8, excessReturn1Y: -2.6,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 1 }, { quarter: "Q1 24", quartile: 2 },
          { quarter: "Q2 24", quartile: 3 }, { quarter: "Q3 24", quartile: 3 },
        ],
        topHoldings: [
          { name: "Growthpoint Properties", weight: 14.2 }, { name: "Redefine Properties", weight: 11.8 },
          { name: "Hyprop Investments", weight: 9.4 }, { name: "SA Corporate RE", weight: 8.1 },
          { name: "Vukile Property Fund", weight: 7.2 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.1, growth: -0.2 }, { date: "Apr", value: 0.1, growth: -0.3 },
          { date: "Jul", value: 0.0, growth: -0.3 }, { date: "Oct", value: -0.1, growth: -0.4 },
        ],
      },
      atlas: {
        fundId: "atlas", name: "Atlas EM Equity",
        return1M: 0.4, return3M: 1.2, return1Y: 8.4, return3Y: 6.1,
        benchmarkReturn1Y: 9.0, excessReturn1Y: -0.6,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 3 }, { quarter: "Q1 24", quartile: 2 },
          { quarter: "Q2 24", quartile: 2 }, { quarter: "Q3 24", quartile: 2 },
        ],
        topHoldings: [
          { name: "Samsung Electronics", weight: 7.8 }, { name: "TSMC", weight: 7.1 },
          { name: "Tencent Holdings", weight: 6.4 }, { name: "Alibaba Group", weight: 5.2 },
          { name: "Infosys", weight: 4.8 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.2, growth: 0.4 }, { date: "Apr", value: 0.1, growth: 0.4 },
          { date: "Jul", value: 0.2, growth: 0.3 }, { date: "Oct", value: 0.2, growth: 0.3 },
        ],
      },
      harness: {
        fundId: "harness", name: "Harness SA Cash",
        return1M: 0.65, return3M: 1.95, return1Y: 7.9, return3Y: 6.8,
        benchmarkReturn1Y: 7.75, excessReturn1Y: 0.15,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 1 }, { quarter: "Q1 24", quartile: 1 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 1 },
        ],
        topHoldings: [
          { name: "SA Treasury Bills (91-day)", weight: 28.4 }, { name: "RMB CP (3-month)", weight: 18.6 },
          { name: "Investec CD (6-month)", weight: 14.2 }, { name: "Nedbank CP (3-month)", weight: 12.8 },
          { name: "Absa NCD (6-month)", weight: 10.1 },
        ],
        styleDrift: [
          { date: "Jan", value: 7.75, growth: 0 }, { date: "Apr", value: 7.75, growth: 0 },
          { date: "Jul", value: 7.75, growth: 0 }, { date: "Oct", value: 7.75, growth: 0 },
        ],
      },
      ridge: {
        fundId: "ridge", name: "Ridge Global Bonds",
        return1M: -0.4, return3M: -1.2, return1Y: 3.8, return3Y: 2.1,
        benchmarkReturn1Y: 4.4, excessReturn1Y: -0.6,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 3 },
          { quarter: "Q2 24", quartile: 2 }, { quarter: "Q3 24", quartile: 2 },
        ],
        topHoldings: [
          { name: "US Treasury 2026", weight: 12.4 }, { name: "German Bund 2027", weight: 10.8 },
          { name: "UK Gilt 2028", weight: 9.1 }, { name: "France OAT 2029", weight: 8.4 },
          { name: "Japan JGB 2027", weight: 7.6 },
        ],
        styleDrift: [
          { date: "Jan", value: 6.8, growth: 0 }, { date: "Apr", value: 7.1, growth: 0 },
          { date: "Jul", value: 7.2, growth: 0 }, { date: "Oct", value: 7.0, growth: 0 },
        ],
      },
      falcon: {
        fundId: "falcon", name: "Falcon SA Equity",
        return1M: -0.8, return3M: -2.1, return1Y: 9.2, return3Y: 7.8,
        benchmarkReturn1Y: 15.0, excessReturn1Y: -5.8,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 3 },
          { quarter: "Q2 24", quartile: 3 }, { quarter: "Q3 24", quartile: 3 },
        ],
        topHoldings: [
          { name: "Naspers / Prosus", weight: 14.8 }, { name: "Discovery Holdings", weight: 10.2 },
          { name: "Capitec Bank", weight: 8.6 }, { name: "Shoprite Holdings", weight: 7.4 },
          { name: "MultiChoice Group", weight: 6.1 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.6, growth: 0.8 }, { date: "Apr", value: 0.7, growth: 0.9 },
          { date: "Jul", value: 0.8, growth: 0.9 }, { date: "Oct", value: 0.8, growth: 1.0 },
        ],
      },
      moss: {
        fundId: "moss", name: "Moss SA Multi-Asset",
        return1M: 0.3, return3M: 1.8, return1Y: 10.1, return3Y: 8.4,
        benchmarkReturn1Y: 9.8, excessReturn1Y: 0.3,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 2 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 2 },
        ],
        topHoldings: [
          { name: "SA Govt 2032", weight: 8.4 }, { name: "Naspers", weight: 6.8 },
          { name: "Standard Bank", weight: 6.1 }, { name: "Global Equity ETF", weight: 5.4 },
          { name: "SA T-Bills", weight: 4.8 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.1, growth: 0.2 }, { date: "Apr", value: 0.1, growth: 0.2 },
          { date: "Jul", value: 0.2, growth: 0.2 }, { date: "Oct", value: 0.1, growth: 0.3 },
        ],
      },
      dune: {
        fundId: "dune", name: "Dune Global Multi-Asset",
        return1M: 1.1, return3M: 3.2, return1Y: 12.8, return3Y: 10.1,
        benchmarkReturn1Y: 11.0, excessReturn1Y: 1.8,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 1 }, { quarter: "Q1 24", quartile: 2 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 1 },
        ],
        topHoldings: [
          { name: "SA Govt 2032", weight: 7.2 }, { name: "Apple Inc", weight: 5.1 },
          { name: "Nvidia Corp", weight: 4.4 }, { name: "Gold ETF", weight: 3.8 },
          { name: "SA T-Bills", weight: 3.2 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.3, growth: 0.5 }, { date: "Apr", value: 0.4, growth: 0.5 },
          { date: "Jul", value: 0.4, growth: 0.6 }, { date: "Oct", value: 0.5, growth: 0.6 },
        ],
      },
      spring: {
        fundId: "spring", name: "Spring SA Bonds",
        return1M: -0.1, return3M: 1.9, return1Y: 10.1, return3Y: 8.0,
        benchmarkReturn1Y: 10.0, excessReturn1Y: -0.1,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 2 },
          { quarter: "Q2 24", quartile: 2 }, { quarter: "Q3 24", quartile: 2 },
        ],
        topHoldings: [
          { name: "SA Govt 2032 (AllBond)", weight: 15.4 }, { name: "SA Govt 2030 (AllBond)", weight: 12.1 },
          { name: "SA Govt 2035 (AllBond)", weight: 10.8 }, { name: "SA Govt 2027 (AllBond)", weight: 9.4 },
          { name: "SA Govt 2044 (AllBond)", weight: 8.2 },
        ],
        styleDrift: [
          { date: "Jan", value: 5.4, growth: 0 }, { date: "Apr", value: 5.4, growth: 0 },
          { date: "Jul", value: 5.4, growth: 0 }, { date: "Oct", value: 5.4, growth: 0 },
        ],
      },
      peak: {
        fundId: "peak", name: "Peak US Equity",
        return1M: 1.8, return3M: 4.2, return1Y: 16.8, return3Y: 13.1,
        benchmarkReturn1Y: 16.9, excessReturn1Y: -0.1,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 1 }, { quarter: "Q1 24", quartile: 1 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 1 },
        ],
        topHoldings: [
          { name: "Apple", weight: 7.1 }, { name: "Microsoft", weight: 6.8 },
          { name: "Nvidia", weight: 6.4 }, { name: "Amazon", weight: 5.2 },
          { name: "Alphabet (A)", weight: 4.1 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.02, growth: 0.01 }, { date: "Apr", value: 0.01, growth: 0.01 },
          { date: "Jul", value: 0.01, growth: 0.02 }, { date: "Oct", value: 0.01, growth: 0.01 },
        ],
      },
      clay: {
        fundId: "clay", name: "Clay SA Value",
        return1M: -1.2, return3M: -3.4, return1Y: 6.8, return3Y: 4.2,
        benchmarkReturn1Y: 15.0, excessReturn1Y: -8.2,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 3 },
          { quarter: "Q2 24", quartile: 4 }, { quarter: "Q3 24", quartile: 4 },
        ],
        topHoldings: [
          { name: "Sasol Limited", weight: 12.4 }, { name: "Anglo Gold Ashanti", weight: 10.8 },
          { name: "Sibanye Stillwater", weight: 9.1 }, { name: "Kumba Iron Ore", weight: 8.4 },
          { name: "Thungela Resources", weight: 7.2 },
        ],
        styleDrift: [
          { date: "Jan", value: -0.9, growth: -0.8 }, { date: "Apr", value: -0.8, growth: -0.8 },
          { date: "Jul", value: -0.9, growth: -0.9 }, { date: "Oct", value: -1.0, growth: -0.9 },
        ],
      },
      alpine: {
        fundId: "alpine", name: "Alpine SA Inflation-Linked Bonds",
        return1M: 0.4, return3M: 1.6, return1Y: 10.8, return3Y: 8.6,
        benchmarkReturn1Y: 10.0, excessReturn1Y: 0.8,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 1 }, { quarter: "Q1 24", quartile: 1 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 1 },
        ],
        topHoldings: [
          { name: "SA ILB Dec 2025", weight: 18.4 }, { name: "SA ILB Mar 2029", weight: 16.8 },
          { name: "SA ILB Mar 2033", weight: 14.2 }, { name: "SA ILB Mar 2038", weight: 12.6 },
          { name: "SA ILB Dec 2050", weight: 8.4 },
        ],
        styleDrift: [
          { date: "Jan", value: 7.2, growth: 0 }, { date: "Apr", value: 7.4, growth: 0 },
          { date: "Jul", value: 7.6, growth: 0 }, { date: "Oct", value: 7.8, growth: 0 },
        ],
      },
      tidal: {
        fundId: "tidal", name: "Tidal Global Infrastructure",
        return1M: 0.6, return3M: 2.8, return1Y: 11.4, return3Y: 9.2,
        benchmarkReturn1Y: 10.4, excessReturn1Y: 1.0,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 1 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 1 },
        ],
        topHoldings: [
          { name: "NextEra Energy", weight: 8.4 }, { name: "Vinci SA", weight: 7.6 },
          { name: "Enbridge Inc", weight: 6.9 }, { name: "National Grid", weight: 6.4 },
          { name: "Brookfield Infra", weight: 5.8 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.4, growth: 0.5 }, { date: "Apr", value: 0.4, growth: 0.5 },
          { date: "Jul", value: 0.5, growth: 0.5 }, { date: "Oct", value: 0.5, growth: 0.6 },
        ],
      },
      meridian: {
        fundId: "meridian", name: "Meridian SA Multi-Asset",
        return1M: 0.2, return3M: 1.4, return1Y: 9.8, return3Y: 8.1,
        benchmarkReturn1Y: 9.5, excessReturn1Y: 0.3,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 2 },
          { quarter: "Q2 24", quartile: 1 }, { quarter: "Q3 24", quartile: 2 },
        ],
        topHoldings: [
          { name: "SA Govt 2032", weight: 9.1 }, { name: "Standard Bank", weight: 7.4 },
          { name: "Naspers", weight: 6.8 }, { name: "SA T-Bills", weight: 5.4 },
          { name: "Growthpoint", weight: 4.2 },
        ],
        styleDrift: [
          { date: "Jan", value: 0.1, growth: 0.2 }, { date: "Apr", value: 0.1, growth: 0.2 },
          { date: "Jul", value: 0.2, growth: 0.3 }, { date: "Oct", value: 0.2, growth: 0.2 },
        ],
      },
      crest: {
        fundId: "crest", name: "Crest Conservative Multi-Asset",
        return1M: 0.3, return3M: 1.1, return1Y: 8.6, return3Y: 7.2,
        benchmarkReturn1Y: 8.2, excessReturn1Y: 0.4,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 1 }, { quarter: "Q1 24", quartile: 1 },
          { quarter: "Q2 24", quartile: 2 }, { quarter: "Q3 24", quartile: 1 },
        ],
        topHoldings: [
          { name: "SA Govt 2030", weight: 14.8 }, { name: "SA T-Bills", weight: 12.4 },
          { name: "Eskom Bonds 2026", weight: 8.6 }, { name: "Redefine Properties", weight: 5.4 },
          { name: "Naspers", weight: 4.8 },
        ],
        styleDrift: [
          { date: "Jan", value: -0.2, growth: -0.1 }, { date: "Apr", value: -0.2, growth: -0.1 },
          { date: "Jul", value: -0.1, growth: -0.1 }, { date: "Oct", value: -0.2, growth: -0.1 },
        ],
      },
      zenith: {
        fundId: "zenith", name: "Zenith Global Bonds",
        return1M: -0.3, return3M: -0.8, return1Y: 3.6, return3Y: 2.0,
        benchmarkReturn1Y: 4.2, excessReturn1Y: -0.6,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 2 }, { quarter: "Q1 24", quartile: 2 },
          { quarter: "Q2 24", quartile: 3 }, { quarter: "Q3 24", quartile: 2 },
        ],
        topHoldings: [
          { name: "US Treasury 2027", weight: 11.8 }, { name: "German Bund 2028", weight: 10.4 },
          { name: "Japan JGB 2026", weight: 9.2 }, { name: "Italy BTP 2029", weight: 8.1 },
          { name: "Spain OAT 2027", weight: 7.4 },
        ],
        styleDrift: [
          { date: "Jan", value: 7.4, growth: 0 }, { date: "Apr", value: 7.6, growth: 0 },
          { date: "Jul", value: 7.8, growth: 0 }, { date: "Oct", value: 7.5, growth: 0 },
        ],
      },
      kalahari: {
        fundId: "kalahari", name: "Kalahari EM Small Cap",
        return1M: 0.8, return3M: 2.4, return1Y: 9.1, return3Y: 7.4,
        benchmarkReturn1Y: 8.8, excessReturn1Y: 0.3,
        quartileHistory: [
          { quarter: "Q4 23", quartile: 3 }, { quarter: "Q1 24", quartile: 2 },
          { quarter: "Q2 24", quartile: 2 }, { quarter: "Q3 24", quartile: 2 },
        ],
        topHoldings: [
          { name: "Samsung SDI", weight: 6.4 }, { name: "Meituan Dianping", weight: 5.8 },
          { name: "Ayala Corporation", weight: 5.2 }, { name: "Emaar Properties", weight: 4.9 },
          { name: "Maruti Suzuki", weight: 4.6 },
        ],
        styleDrift: [
          { date: "Jan", value: -0.4, growth: -0.1 }, { date: "Apr", value: -0.3, growth: -0.1 },
          { date: "Jul", value: -0.3, growth: 0.0 }, { date: "Oct", value: -0.4, growth: 0.0 },
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
