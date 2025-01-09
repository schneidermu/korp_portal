export interface Paged<T> {
  count: number;
  next: string | null; // URI
  previous: string | null; // URI
  results: T[];
}
