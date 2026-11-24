import type { ConnectorMeta } from "../../../connectors/types";

interface Props {
  meta: ConnectorMeta;
  className?: string;
}

export default function SourceBadge({ meta, className }: Props) {
  return (
    <span className={`source-badge${className ? ` ${className}` : ""}`}>
      {meta.source} · {meta.asOf} · simulated
    </span>
  );
}
