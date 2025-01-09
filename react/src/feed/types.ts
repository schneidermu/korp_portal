export interface News {
  kind: "news";
  id: number;
  publishedAt: Date;
  title: string;
  text: string;
  images: string[]; // URIs
  video: string | null; // URI
  organizations: number[];
}

export interface Choice {
  id: number;
  text: string;
  voters: Set<string>;
  votes: number;
}

export interface Poll {
  kind: "polls";
  id: number;
  publishedAt: Date;
  title: "Опрос";
  question: string;
  choices: Choice[];
  votes: number;
  isAnonymous: boolean;
  isMultipleChoice: boolean;
}

export type Post = News | Poll;
