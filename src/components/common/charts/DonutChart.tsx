interface Segment {
  label: string;
  pct: number;
  color: string;
}

interface Props {
  segments: Segment[];
  centerLabel: string;
  centerSub?: string;
  size?: number;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segPath(cx: number, cy: number, outer: number, inner: number, start: number, end: number) {
  const o1 = polar(cx, cy, outer, start);
  const o2 = polar(cx, cy, outer, end);
  const i1 = polar(cx, cy, inner, end);
  const i2 = polar(cx, cy, inner, start);
  const large = end - start > 180 ? 1 : 0;
  return [
    `M${o1.x.toFixed(2)},${o1.y.toFixed(2)}`,
    `A${outer},${outer},0,${large},1,${o2.x.toFixed(2)},${o2.y.toFixed(2)}`,
    `L${i1.x.toFixed(2)},${i1.y.toFixed(2)}`,
    `A${inner},${inner},0,${large},0,${i2.x.toFixed(2)},${i2.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export default function DonutChart({ segments, centerLabel, centerSub, size = 120 }: Props) {
  const cx = size / 2, cy = size / 2;
  const outer = size * 0.44;
  const inner = size * 0.28;
  const total = segments.reduce((s, seg) => s + seg.pct, 0);

  const arcs = segments.reduce<Array<Segment & { start: number; end: number }>>((acc, seg) => {
    const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
    const end = start + (seg.pct / total) * 360;
    return [...acc, { ...seg, start, end }];
  }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((arc, i) => (
        <path
          key={i}
          d={segPath(cx, cy, outer, inner, arc.start, arc.end - 0.5)}
          fill={arc.color}
          opacity={0.9}
        />
      ))}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={size * 0.13} fontWeight={680} fill="#e6e9ed">{centerLabel}</text>
      {centerSub && <text x={cx} y={cy + size * 0.12} textAnchor="middle" fontSize={size * 0.08} fill="#9aa3ad">{centerSub}</text>}
    </svg>
  );
}
