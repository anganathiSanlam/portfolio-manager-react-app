interface Props {
  actual: number;
  target: number;
  status: "on-track" | "behind";
  size?: number;
}

export default function ProgressRing({ actual, target, status, size = 72 }: Props) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.4;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(actual / target, 1.05);
  const filled = Math.min(pct, 1) * circumference;
  const color = status === "on-track" ? "#8bc7ac" : "#df747c";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#303943" strokeWidth={6} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${filled.toFixed(2)} ${circumference.toFixed(2)}`}
        strokeDashoffset={(circumference * 0.75).toFixed(2)}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .4s ease" }}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.18} fontWeight={700} fill={color}>
        {actual.toFixed(1)}%
      </text>
    </svg>
  );
}
