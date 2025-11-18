export interface Paged<T> {
  count: number;
  next: string | null; // URI
  previous: string | null; // URI
  results: T[];
}

export interface Attachment {
  name: string;
  /// size in bytes
  size: number;
  dataURL: string;
}
