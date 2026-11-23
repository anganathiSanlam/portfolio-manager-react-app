interface Props {
  values: number[];
  width?: number;
  height?: number;
}

export default function Sparkline({ values, width = 60, height = 24 }: Props) {
  const max = Math.max(...values.map(Math.abs), 0.01);
  const n = values.length;
  const gap = 2;
  const barW = (width - gap * (n - 1)) / n;
  const midY = height / 2;

  return (
    <svg width={width} height={height} style={{ display: "block", flexShrink: 0 }}>
      <line x1={0} y1={midY} x2={width} y2={midY} stroke="#303943" strokeWidth={0.5} />
      {values.map((v, i) => {
        const h = Math.max((Math.abs(v) / max) * (midY - 2), 1);
        const x = i * (barW + gap);
        const y = v >= 0 ? midY - h : midY;
        return (
          <rect key={i} x={x} y={y} width={barW} height={h} fill={v >= 0 ? "#8bc7ac" : "#df747c"} rx={1} />
        );
      })}
    </svg>
  );
}
