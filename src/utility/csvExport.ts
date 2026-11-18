import { fundUniverse, portfolioFunds, pageData } from "../data";

export function exportCsv(activeSection: string): { csv: string; filename: string } | null {
  let columns: string[];
  let rows: string[][];

  if (activeSection === "funds") {
    columns = ["Fund", "Role", "Moderate", "12M excess", "Fee", "Rating / status"];
    rows = fundUniverse.map((fund) => [fund.name, fund.role, fund.weight, fund.excess, fund.fee, fund.rating]);
  } else if (activeSection === "portfolios") {
    columns = ["Fund", "Weight / plan", "MTD excess", "Fee", "Research"];
    rows = portfolioFunds;
  } else {
    const data = pageData[activeSection];
    if (!data || !data.columns || !data.rows) return null;
    columns = data.columns;
    rows = data.rows;
  }

  const csv = [columns, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  return { csv, filename: `${activeSection}-illustrative.csv` };
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
