import { User } from "@/features/user/types";

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
  // Voters other than the current user.
  voters: Set<string>;
  votes: number;
}

export interface Poll {
  kind: "polls";
  id: number;
  publishedAt: Date;
  question: string;
  choices: Map<number, Choice>;
  votes: number;
  myChoices: Set<number>;
  voted: boolean;
  isAnonymous: boolean;
  isMultipleChoice: boolean;
  orgs: Set<number>;
}

export interface Birthday {
  kind: "birthday";
  id: string;
  publishedAt: Date;
  users: User[];
}

export type Post = News | Poll | Birthday;
