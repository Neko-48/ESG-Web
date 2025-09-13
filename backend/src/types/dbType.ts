export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
}