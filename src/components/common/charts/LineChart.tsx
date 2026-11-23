const W = 500, H = 110;
const PAD = { t: 8, r: 12, b: 22, l: 8 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

function pt(vals: number[], min: number, range: number, i: number) {
  const x = PAD.l + (i / (vals.length - 1)) * IW;
  const y = PAD.t + (1 - (vals[i] - min) / range) * IH;
  return { x, y };
}

function linePath(vals: number[], min: number, range: number) {
  return vals.map((_, i) => {
    const { x, y } = pt(vals, min, range, i);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function areaPath(vals: number[], min: number, range: number) {
  const bottom = PAD.t + IH;
  const pts = vals.map((_, i) => {
    const { x, y } = pt(vals, min, range, i);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(" ")} L${(PAD.l + IW).toFixed(1)},${bottom} L${PAD.l},${bottom} Z`;
}

interface Props {
  portfolio: number[];
  benchmark: number[];
  months: string[];
}

export default function LineChart({ portfolio, benchmark, months }: Props) {
  const all = [...portfolio, ...benchmark];
  const rawMin = Math.min(...all);
  const rawMax = Math.max(...all);
  const pad = (rawMax - rawMin) * 0.08;
  const min = rawMin - pad;
  const range = rawMax - rawMin + 2 * pad;

  const n = months.length;
  const labelIdxs = [0, Math.floor(n / 3), Math.floor(2 * n / 3), n - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8bc7ac" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8bc7ac" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5568" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4a5568" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath(benchmark, min, range)} fill="url(#bGrad)" />
      <path d={areaPath(portfolio, min, range)} fill="url(#pGrad)" />
      <path d={linePath(benchmark, min, range)} fill="none" stroke="#4a5568" strokeWidth={1.5} strokeDasharray="4 2" />
      <path d={linePath(portfolio, min, range)} fill="none" stroke="#8bc7ac" strokeWidth={2} />
      {labelIdxs.map(i => {
        const x = PAD.l + (i / (n - 1)) * IW;
        return (
          <text key={i} x={x} y={H - 4} fontSize={8} fill="#727d88" textAnchor="middle">{months[i]}</text>
        );
      })}
      <circle cx={PAD.l + IW} cy={pt(portfolio, min, range, n - 1).y} r={3} fill="#8bc7ac" />
    </svg>
  );
}
