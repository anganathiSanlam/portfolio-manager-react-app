export interface ConnectorMeta {
  source: string;
  asOf: string;
  simulated: true;
}

export type WithMeta<T> = T & { _meta: ConnectorMeta };

export function withMeta<T>(data: T, source: string, asOf: string): WithMeta<T> {
  return { ...data, _meta: { source, asOf, simulated: true } };
}
