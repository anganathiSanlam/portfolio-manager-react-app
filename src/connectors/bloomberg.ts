import type { ConnectorMeta } from "./types";

export interface MarketReturn {
  name: string;
  category: "index" | "sector" | "commodity" | "currency" | "bond";
  mtdUSD: number | null;
  qtdUSD: number | null;
  oneMonthUSD: number | null;
  mtdZAR: number | null;
  qtdZAR: number | null;
  oneMonthZAR: number | null;
}

export interface PEPoint  { date: string; pe: number; }
export interface EPSPoint { date: string; growth: number; }

export interface MarketValuation {
  currentPE: number;
  longRunMeanPE: number;
  peSeries: PEPoint[];
  epsSeries: EPSPoint[];
  currentEPSGrowth: number;
  prevEPSGrowth: number;
  consensusEPSGrowth: number;
  dividendYield: number;
}

export interface BloombergData {
  returns: MarketReturn[];
  valuations: Record<string, MarketValuation>;
  asOfDate: string;
  _meta: ConnectorMeta;
}

export const VALUATION_MARKETS = [
  "MSCI World", "MSCI EM", "FTSE/JSE ALSI", "S&P 500",
  "Global Infrastructure", "Global Listed Property", "SA Listed Property",
  "NIFTY", "CSI 300", "US Credit",
] as const;
export type ValuationMarket = typeof VALUATION_MARKETS[number];

const D = ["Nov '25","Dec '25","Jan '26","Feb '26","Mar '26","Apr '26",
           "May '26","Jun '26","Jul '26","Aug '26","Sep '26","Oct '26"];
const pe  = (v: number[]) => v.map((pe, i)     => ({ date: D[i], pe }));
const eps = (v: number[]) => v.map((growth, i) => ({ date: D[i], growth }));

export async function getBloombergData(): Promise<BloombergData> {
  return {
    asOfDate: "31 Oct 2026",
    returns: [
      { name: "MSCI World",            category: "index",     mtdUSD:  2.1, qtdUSD:  5.4, oneMonthUSD:  2.1, mtdZAR:  3.6, qtdZAR:  7.1, oneMonthZAR:  3.6 },
      { name: "MSCI EM",               category: "index",     mtdUSD:  1.3, qtdUSD:  3.8, oneMonthUSD:  1.3, mtdZAR:  2.8, qtdZAR:  5.5, oneMonthZAR:  2.8 },
      { name: "S&P 500",               category: "index",     mtdUSD:  1.8, qtdUSD:  4.9, oneMonthUSD:  1.8, mtdZAR:  3.3, qtdZAR:  6.6, oneMonthZAR:  3.3 },
      { name: "MSCI EM ex-China",      category: "index",     mtdUSD:  2.4, qtdUSD:  5.1, oneMonthUSD:  2.4, mtdZAR:  3.9, qtdZAR:  6.8, oneMonthZAR:  3.9 },
      { name: "Global Infrastructure", category: "index",     mtdUSD:  1.4, qtdUSD:  3.6, oneMonthUSD:  1.4, mtdZAR:  2.9, qtdZAR:  5.3, oneMonthZAR:  2.9 },
      { name: "Global Listed Property",category: "index",     mtdUSD:  0.8, qtdUSD:  2.1, oneMonthUSD:  0.8, mtdZAR:  2.3, qtdZAR:  3.8, oneMonthZAR:  2.3 },
      { name: "Brent Crude",           category: "commodity", mtdUSD: -1.2, qtdUSD: -3.4, oneMonthUSD: -1.2, mtdZAR:  0.3, qtdZAR: -1.7, oneMonthZAR:  0.3 },
      { name: "Gold",                  category: "commodity", mtdUSD:  2.8, qtdUSD:  4.9, oneMonthUSD:  2.8, mtdZAR:  4.3, qtdZAR:  6.6, oneMonthZAR:  4.3 },
      { name: "USD/ZAR",               category: "currency",  mtdUSD: null, qtdUSD: null, oneMonthUSD: null, mtdZAR: -1.5, qtdZAR: -1.7, oneMonthZAR: -1.5 },
      { name: "EUR/ZAR",               category: "currency",  mtdUSD: null, qtdUSD: null, oneMonthUSD: null, mtdZAR: -0.9, qtdZAR: -1.2, oneMonthZAR: -0.9 },
      { name: "Global Bonds (Agg)",    category: "bond",      mtdUSD:  0.4, qtdUSD:  1.1, oneMonthUSD:  0.4, mtdZAR:  1.9, qtdZAR:  2.8, oneMonthZAR:  1.9 },
      { name: "US Treasuries",         category: "bond",      mtdUSD: -0.3, qtdUSD:  0.4, oneMonthUSD: -0.3, mtdZAR:  1.2, qtdZAR:  2.1, oneMonthZAR:  1.2 },
    ],
    valuations: {
      "MSCI World": {
        currentPE: 17.8, longRunMeanPE: 15.2, currentEPSGrowth: 11.2, prevEPSGrowth: 10.9, consensusEPSGrowth: 11.2, dividendYield: 2.1,
        peSeries:  pe( [16.8,17.1,17.4,17.2,16.9,17.5,17.9,17.6,17.4,17.8,18.1,17.8]),
        epsSeries: eps([ 9.1, 9.5,10.0,10.3,10.6,10.9,10.5,10.9,11.2,11.5,11.1,11.2]),
      },
      "MSCI EM": {
        currentPE: 11.4, longRunMeanPE: 10.8, currentEPSGrowth: 14.5, prevEPSGrowth: 13.8, consensusEPSGrowth: 14.5, dividendYield: 2.8,
        peSeries:  pe( [10.4,10.8,11.1,10.9,10.5,11.0,11.4,11.1,10.9,11.4,11.7,11.4]),
        epsSeries: eps([11.2,11.8,12.4,12.8,13.1,13.5,13.1,13.6,13.9,14.2,13.8,14.5]),
      },
      "FTSE/JSE ALSI": {
        currentPE: 10.2, longRunMeanPE: 11.5, currentEPSGrowth:  8.4, prevEPSGrowth:  7.9, consensusEPSGrowth:  8.4, dividendYield: 3.5,
        peSeries:  pe( [11.2,11.0,10.8,10.5,10.3,10.6,10.9,10.6,10.4,10.2,10.4,10.2]),
        epsSeries: eps([ 6.1, 6.5, 6.9, 7.2, 7.5, 7.8, 7.4, 7.9, 8.1, 8.4, 7.9, 8.4]),
      },
      "S&P 500": {
        currentPE: 19.8, longRunMeanPE: 16.4, currentEPSGrowth: 12.1, prevEPSGrowth: 11.8, consensusEPSGrowth: 12.1, dividendYield: 1.4,
        peSeries:  pe( [18.4,18.9,19.2,19.0,18.5,19.1,19.6,19.3,19.0,19.8,20.1,19.8]),
        epsSeries: eps([ 9.8,10.2,10.6,10.9,11.2,11.5,11.1,11.5,11.8,12.1,11.8,12.1]),
      },
      "Global Infrastructure": {
        currentPE: 20.4, longRunMeanPE: 18.6, currentEPSGrowth:  7.8, prevEPSGrowth:  7.5, consensusEPSGrowth:  7.8, dividendYield: 3.9,
        peSeries:  pe( [19.1,19.4,19.8,19.5,19.1,19.6,20.0,19.7,19.5,20.4,20.6,20.4]),
        epsSeries: eps([ 6.2, 6.5, 6.8, 7.0, 7.2, 7.5, 7.1, 7.5, 7.7, 7.8, 7.5, 7.8]),
      },
      "Global Listed Property": {
        currentPE: 24.1, longRunMeanPE: 21.2, currentEPSGrowth:  5.2, prevEPSGrowth:  5.0, consensusEPSGrowth:  5.2, dividendYield: 3.2,
        peSeries:  pe( [22.1,22.5,22.9,22.5,21.8,22.4,22.9,22.6,23.1,24.1,24.4,24.1]),
        epsSeries: eps([ 3.8, 4.1, 4.3, 4.5, 4.7, 4.9, 4.6, 4.9, 5.1, 5.2, 5.0, 5.2]),
      },
      "SA Listed Property": {
        currentPE: 14.8, longRunMeanPE: 16.3, currentEPSGrowth:  3.1, prevEPSGrowth:  2.8, consensusEPSGrowth:  3.1, dividendYield: 5.4,
        peSeries:  pe( [16.4,16.1,15.8,15.4,15.1,15.5,15.8,15.5,15.1,14.8,15.1,14.8]),
        epsSeries: eps([ 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.1, 2.5, 2.7, 3.1, 2.8, 3.1]),
      },
      "NIFTY": {
        currentPE: 21.5, longRunMeanPE: 18.9, currentEPSGrowth: 15.8, prevEPSGrowth: 15.1, consensusEPSGrowth: 15.8, dividendYield: 1.2,
        peSeries:  pe( [19.8,20.1,20.5,20.2,19.8,20.4,20.9,20.5,21.0,21.5,21.8,21.5]),
        epsSeries: eps([12.4,12.8,13.2,13.5,13.8,14.1,13.7,14.1,14.4,15.1,15.1,15.8]),
      },
      "CSI 300": {
        currentPE: 10.8, longRunMeanPE: 11.4, currentEPSGrowth: 10.2, prevEPSGrowth:  9.8, consensusEPSGrowth: 10.2, dividendYield: 2.6,
        peSeries:  pe( [11.8,11.5,11.1,10.8,10.4,10.9,11.3,11.0,10.5,10.8,11.1,10.8]),
        epsSeries: eps([ 7.8, 8.1, 8.4, 8.8, 9.1, 9.4, 9.0, 9.4, 9.7,10.2, 9.8,10.2]),
      },
      "US Credit": {
        currentPE:  8.4, longRunMeanPE:  9.2, currentEPSGrowth: -2.1, prevEPSGrowth: -1.8, consensusEPSGrowth: -2.1, dividendYield: 5.8,
        peSeries:  pe( [ 9.4, 9.1, 8.8, 8.5, 8.2, 8.6, 8.9, 8.6, 8.2, 8.4, 8.6, 8.4]),
        epsSeries: eps([-3.1,-2.8,-2.5,-2.2,-1.9,-1.6,-2.0,-1.6,-1.4,-2.1,-1.8,-2.1]),
      },
    },
    _meta: { source: "Bloomberg", asOf: "31 Oct 2026", simulated: true },
  };
}
