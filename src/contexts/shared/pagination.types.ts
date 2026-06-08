export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}

export function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8');
}
