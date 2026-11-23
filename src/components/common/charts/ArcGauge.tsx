interface Props {
  current: number;
  limit: number;
  label: string;
  portfolio: string;
  size?: number;
}

function pt(cx: number, cy: number, r: number, deg: number) {
  const rad = deg * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function ArcGauge({ current, limit, label, portfolio, size = 90 }: Props) {
  const utilization = Math.min(current / limit, 1);
  const cx = size / 2;
  const cy = size * 0.62;
  const r = size * 0.38;
  const sw = size * 0.07;

  const startDeg = 180;
  const endDeg = 0;
  const fillDeg = startDeg - utilization * 180;

  const bgStart = pt(cx, cy, r, startDeg);
  const bgEnd = pt(cx, cy, r, endDeg);
  const fillEnd = pt(cx, cy, r, fillDeg);

  const color = utilization >= 0.95 ? "#df747c" : utilization >= 0.80 ? "#e7c47c" : "#8bc7ac";

  const bgPath = `M${bgStart.x.toFixed(2)},${bgStart.y.toFixed(2)} A${r},${r},0,0,1,${bgEnd.x.toFixed(2)},${bgEnd.y.toFixed(2)}`;
  const fillLarge = utilization > 0.5 ? 1 : 0;
  const fillPath = `M${bgStart.x.toFixed(2)},${bgStart.y.toFixed(2)} A${r},${r},0,${fillLarge},1,${fillEnd.x.toFixed(2)},${fillEnd.y.toFixed(2)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`} style={{ overflow: "visible" }}>
        <path d={bgPath} fill="none" stroke="#303943" strokeWidth={sw} strokeLinecap="round" />
        <path d={fillPath} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <text x={cx} y={cy - sw / 2} textAnchor="middle" fontSize={size * 0.14} fontWeight={680} fill={color}>
          {current.toFixed(1)}%
        </text>
        <text x={cx} y={cy + size * 0.1} textAnchor="middle" fontSize={size * 0.09} fill="#727d88">
          / {limit.toFixed(1)}%
        </text>
      </svg>
      <div style={{ textAlign: "center", fontSize: 11, fontWeight: 630, color: "var(--text)", lineHeight: 1.3 }}>{label}</div>
      <div style={{ textAlign: "center", fontSize: 10, color: "var(--muted)" }}>{portfolio}</div>
    </div>
  );
}
