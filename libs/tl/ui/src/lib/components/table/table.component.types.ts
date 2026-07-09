export interface TlTableRow {
  [key: string]: unknown;
}

export type TlAlign = 'left' | 'center' | 'right';

export type TlSortOrder = 'asc' | 'desc' | '';

export interface TlRowClickEvent<T> {
  row: T;
  index: number;
}
