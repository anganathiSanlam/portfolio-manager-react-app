const TICKER_ITEMS = [
  { label: "JSE All Share",  value: "83,247",   change: +0.84 },
  { label: "S&P 500",        value: "5,942",    change: +1.23 },
  { label: "NASDAQ",         value: "19,186",   change: -0.41 },
  { label: "FTSE 100",       value: "8,312",    change: +0.67 },
  { label: "DAX",            value: "19,843",   change: +1.12 },
  { label: "MSCI World",     value: "3,587",    change: +0.91 },
  { label: "MSCI EM",        value: "1,124",    change: -0.56 },
  { label: "USD/ZAR",        value: "18.23",    change: +0.34 },
  { label: "EUR/USD",        value: "1.0542",   change: -0.18 },
  { label: "GBP/USD",        value: "1.2681",   change: +0.09 },
  { label: "Gold",           value: "$2,634",   change: +0.52 },
  { label: "Brent Crude",    value: "$74.18",   change: -1.24 },
  { label: "SA 10Y Bond",    value: "9.42%",    change: -0.08 },
  { label: "US 10Y Bond",    value: "4.31%",    change: +0.04 },
  { label: "Bitcoin",        value: "$97,842",  change: +2.14 },
  { label: "ALBI",           value: "642.18",   change: +0.31 },
];

/* Duplicate so the CSS -50% translate loops seamlessly */
const DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

export default function StatusBar() {
  return (
    <div className="ticker-bar">
      <span className="ticker-live">
        <span className="ticker-live-dot" />
        Live
      </span>
      <div className="ticker-wrap">
        <div className="ticker-track">
          {DOUBLED.map((item, i) => {
            const up = item.change >= 0;
            return (
              <span key={i} className="ticker-item">
                <span className="ticker-name">{item.label}</span>
                <span className="ticker-value">{item.value}</span>
                <span className={`ticker-change ${up ? "up" : "down"}`}>
                  {up ? "▲" : "▼"} {up ? "+" : ""}{item.change.toFixed(2)}%
                </span>
                <span className="ticker-sep">|</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
