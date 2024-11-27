export interface Post {
  id: number;
  title: string;
  text: string;
  images: string[]; // URIs
  video: string | null; // URI
  organizations: number[];
}
