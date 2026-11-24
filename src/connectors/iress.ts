import type { ConnectorMeta } from "./types";

export interface SASectorReturn {
  sector: string;
  mtd: number;
  qtd: number;
  oneMonth: number;
  ytd: number;
}

export interface IressData {
  sectors: SASectorReturn[];
  _meta: ConnectorMeta;
}

export async function getIressData(): Promise<IressData> {
  return {
    sectors: [
      { sector: "JSE ALSI",        mtd:  3.5, qtd:  7.2, oneMonth:  3.5, ytd: 14.8 },
      { sector: "JSE Resources",   mtd:  4.1, qtd:  9.3, oneMonth:  4.1, ytd: 11.2 },
      { sector: "JSE Financials",  mtd:  2.8, qtd:  6.1, oneMonth:  2.8, ytd: 18.4 },
      { sector: "JSE Industrials", mtd:  3.1, qtd:  5.8, oneMonth:  3.1, ytd: 12.9 },
      { sector: "SA Property",     mtd:  1.9, qtd:  4.2, oneMonth:  1.9, ytd:  8.1 },
      { sector: "SA Bonds (ALBI)", mtd:  1.4, qtd:  3.6, oneMonth:  1.4, ytd: 10.8 },
      { sector: "SA ILBs",         mtd:  0.9, qtd:  2.1, oneMonth:  0.9, ytd:  7.4 },
      { sector: "SA Cash (STeFI)", mtd:  0.6, qtd:  1.9, oneMonth:  0.6, ytd:  7.9 },
    ],
    _meta: { source: "IRESS", asOf: "31 Oct 2026", simulated: true },
  };
}
