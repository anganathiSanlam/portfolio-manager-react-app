export type Platform = "NinetyOne" | "Old Mutual" | "Glacier" | "Sanlam Wealth";
export type TradeStatus = "Pending" | "Active" | "Settled" | "Cancelled";
export type TradeInstruction = "Buy" | "Sell" | "Switch" | "Mixed";

export interface TradeHolding {
  fundName: string;
  isin: string;
  assetClass: string;
  instruction: "Buy" | "Sell" | "Switch";
  allocationPct: number;
  valueZAR: number;
  units?: number;
  pricePerUnit?: number;
  switchFromFund?: string;
}

export interface ImportedTrade {
  id: string;
  importDate: string;
  platform: Platform;
  clientId: string;
  clientName: string;
  reference: string;
  tradeDate: string;
  settlementDate: string;
  status: TradeStatus;
  instruction: TradeInstruction;
  totalValueZAR: number;
  currency: "ZAR";
  holdings: TradeHolding[];
  notes: string;
  _importedFrom: "demo" | "excel";
}

function deriveInstruction(holdings: TradeHolding[]): TradeInstruction {
  const types = new Set(holdings.map(h => h.instruction));
  if (types.size === 1) return [...types][0] as "Buy" | "Sell" | "Switch";
  return "Mixed";
}

export function getDummyTrades(): ImportedTrade[] {
  const trades: Omit<ImportedTrade, "instruction">[] = [
    {
      id: "T001",
      importDate: "2026-11-10",
      platform: "NinetyOne",
      clientId: "c001",
      clientName: "Thabo Nkosi",
      reference: "NIN-2026-11-001",
      tradeDate: "2026-11-10",
      settlementDate: "2026-11-14",
      status: "Settled",
      totalValueZAR: 2_400_000,
      currency: "ZAR",
      notes: "Moderate portfolio initial build. Client signed mandate 2026-11-08. FAIS record filed.",
      _importedFrom: "demo",
      holdings: [
        { fundName: "Northstar Global Quality Growth", isin: "ZACM0001234B", assetClass: "Global Equity",   instruction: "Buy", allocationPct: 25, valueZAR: 600_000,   units: 3_428,  pricePerUnit: 175.02 },
        { fundName: "Umzi SA Bond Fund",               isin: "ZACM0002345C", assetClass: "SA Bonds",        instruction: "Buy", allocationPct: 35, valueZAR: 840_000,   units: 7_619,  pricePerUnit: 110.26 },
        { fundName: "Protea SA Value Equity",          isin: "ZACM0003456D", assetClass: "SA Equity",       instruction: "Buy", allocationPct: 25, valueZAR: 600_000,   units: 5_217,  pricePerUnit: 115.02 },
        { fundName: "Harness SA Cash",                 isin: "ZACM0007890H", assetClass: "SA Cash",         instruction: "Buy", allocationPct: 15, valueZAR: 360_000,   units: 3_477,  pricePerUnit: 103.52 },
      ],
    },
    {
      id: "T002",
      importDate: "2026-11-15",
      platform: "Glacier",
      clientId: "c003",
      clientName: "Priya Reddy",
      reference: "GLA-2026-11-047",
      tradeDate: "2026-11-15",
      settlementDate: "2026-11-21",
      status: "Active",
      totalValueZAR: 1_850_000,
      currency: "ZAR",
      notes: "Aggressive growth mandate. Client risk tolerance confirmed HIGH. FAIS record on file.",
      _importedFrom: "demo",
      holdings: [
        { fundName: "Northstar Global Quality Growth", isin: "ZACM0001234B", assetClass: "Global Equity",   instruction: "Buy", allocationPct: 40, valueZAR: 740_000,   units: 4_228,  pricePerUnit: 175.09 },
        { fundName: "Atlas EM Equity",                 isin: "ZACM0006789G", assetClass: "EM Equity",       instruction: "Buy", allocationPct: 30, valueZAR: 555_000,   units: 4_125,  pricePerUnit: 134.54 },
        { fundName: "Falcon SA Growth Equity",         isin: "ZACM0008901F", assetClass: "SA Equity",       instruction: "Buy", allocationPct: 20, valueZAR: 370_000,   units: 3_045,  pricePerUnit: 121.51 },
        { fundName: "Cedar SA Infrastructure",         isin: "ZACM0005678E", assetClass: "Infrastructure",  instruction: "Buy", allocationPct: 10, valueZAR: 185_000,   units: 1_612,  pricePerUnit: 114.76 },
      ],
    },
    {
      id: "T003",
      importDate: "2026-11-20",
      platform: "Old Mutual",
      clientId: "c007",
      clientName: "Cape Town Community Foundation",
      reference: "OMF-2026-11-203",
      tradeDate: "2026-11-20",
      settlementDate: "2026-11-27",
      status: "Pending",
      totalValueZAR: 5_200_000,
      currency: "ZAR",
      notes: "Conservative endowment mandate. Board resolution attached. Capital preservation priority.",
      _importedFrom: "demo",
      holdings: [
        { fundName: "Umzi SA Bond Fund",          isin: "ZACM0002345C", assetClass: "SA Bonds",    instruction: "Buy", allocationPct: 50, valueZAR: 2_600_000, units: 23_582, pricePerUnit: 110.26 },
        { fundName: "Crest Capital Preservation", isin: "ZACM0014321K", assetClass: "Multi-Asset", instruction: "Buy", allocationPct: 30, valueZAR: 1_560_000, units: 11_803, pricePerUnit: 132.17 },
        { fundName: "Harness SA Cash",            isin: "ZACM0007890H", assetClass: "SA Cash",     instruction: "Buy", allocationPct: 20, valueZAR: 1_040_000, units: 10_046, pricePerUnit: 103.52 },
      ],
    },
    {
      id: "T004",
      importDate: "2026-11-18",
      platform: "Sanlam Wealth",
      clientId: "c009",
      clientName: "Sibonelo Dlamini Family Trust",
      reference: "SWM-2026-11-089",
      tradeDate: "2026-11-18",
      settlementDate: "2026-11-25",
      status: "Active",
      totalValueZAR: 3_100_000,
      currency: "ZAR",
      notes: "Bespoke mandate rebalance. Switching out of Global Index into active Northstar. IC approval ref IC-2026-11-04.",
      _importedFrom: "demo",
      holdings: [
        { fundName: "Tidal Global Infrastructure",     isin: "ZACM0016543L", assetClass: "Infrastructure", instruction: "Buy",    allocationPct: 25, valueZAR: 775_000, units: 5_962, pricePerUnit: 130.00 },
        { fundName: "Alpine SA ILBs",                  isin: "ZACM0013210J", assetClass: "SA ILBs",        instruction: "Buy",    allocationPct: 20, valueZAR: 620_000, units: 5_438, pricePerUnit: 114.03 },
        { fundName: "Northstar Global Quality Growth", isin: "ZACM0001234B", assetClass: "Global Equity",  instruction: "Switch", allocationPct: 30, valueZAR: 930_000, switchFromFund: "Global Index Partners MSCI World" },
        { fundName: "Meridian SA Multi-Asset",         isin: "ZACM0015432M", assetClass: "Multi-Asset",    instruction: "Buy",    allocationPct: 25, valueZAR: 775_000, units: 6_025, pricePerUnit: 128.65 },
      ],
    },
    {
      id: "T005",
      importDate: "2026-10-28",
      platform: "NinetyOne",
      clientId: "c002",
      clientName: "Nomsa Mahlangu",
      reference: "NIN-2026-10-187",
      tradeDate: "2026-10-28",
      settlementDate: "2026-11-01",
      status: "Settled",
      totalValueZAR: 890_000,
      currency: "ZAR",
      notes: "Moderate portfolio top-up following October quarterly review.",
      _importedFrom: "demo",
      holdings: [
        { fundName: "Protea SA Value Equity",           isin: "ZACM0003456D", assetClass: "SA Equity",   instruction: "Buy", allocationPct: 35, valueZAR: 311_500, units: 2_708, pricePerUnit: 115.02 },
        { fundName: "Umzi SA Bond Fund",                isin: "ZACM0002345C", assetClass: "SA Bonds",    instruction: "Buy", allocationPct: 40, valueZAR: 356_000, units: 3_229, pricePerUnit: 110.26 },
        { fundName: "Global Index Partners MSCI World", isin: "ZACM0004567E", assetClass: "Global Equity", instruction: "Buy", allocationPct: 25, valueZAR: 222_500, units: 1_418, pricePerUnit: 156.91 },
      ],
    },
    {
      id: "T006",
      importDate: "2026-11-22",
      platform: "Glacier",
      clientId: "c013",
      clientName: "Wellington & Associates",
      reference: "GLA-2026-11-052",
      tradeDate: "2026-11-22",
      settlementDate: "2026-11-29",
      status: "Pending",
      totalValueZAR: 8_400_000,
      currency: "ZAR",
      notes: "Large bespoke mandate initial build. Global multi-asset tilt approved at IC-2026-11-04. FX exposure reviewed and accepted.",
      _importedFrom: "demo",
      holdings: [
        { fundName: "Dune Global Multi-Asset",         isin: "ZACM0012109I", assetClass: "Multi-Asset",  instruction: "Buy", allocationPct: 30, valueZAR: 2_520_000, units: 12_543, pricePerUnit: 200.90 },
        { fundName: "Tidal Global Infrastructure",     isin: "ZACM0016543L", assetClass: "Infrastructure", instruction: "Buy", allocationPct: 20, valueZAR: 1_680_000, units: 12_923, pricePerUnit: 130.00 },
        { fundName: "Kalahari EM Small Cap",           isin: "ZACM0021987P", assetClass: "EM Equity",    instruction: "Buy", allocationPct: 15, valueZAR: 1_260_000, units:  8_400, pricePerUnit: 150.00 },
        { fundName: "Peak US Equity Index",            isin: "ZACM0011098H", assetClass: "Global Equity", instruction: "Buy", allocationPct: 20, valueZAR: 1_680_000, units:  7_875, pricePerUnit: 213.33 },
        { fundName: "Zenith Global Bonds",             isin: "ZACM0020876O", assetClass: "Global Bonds", instruction: "Buy", allocationPct: 15, valueZAR: 1_260_000, units: 10_500, pricePerUnit: 120.00 },
      ],
    },
  ];

  return trades.map(t => ({ ...t, instruction: deriveInstruction(t.holdings) }));
}

export const PLATFORM_SHORTS: Record<Platform, string> = {
  "NinetyOne":    "NIN",
  "Old Mutual":   "OMF",
  "Glacier":      "GLA",
  "Sanlam Wealth": "SWM",
};

export const EXCEL_TEMPLATE_HEADERS = [
  "Fund Name", "ISIN", "Asset Class", "Instruction (Buy/Sell/Switch)",
  "Allocation %", "Value ZAR", "Units", "Price Per Unit", "Switch From Fund",
];

export const EXCEL_TEMPLATE_EXAMPLE = [
  "Northstar Global Quality Growth", "ZACM0001234B", "Global Equity",
  "Buy", "25", "600000", "3428", "175.02", "",
];
