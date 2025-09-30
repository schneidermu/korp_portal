import * as R from "radashi";

export interface News {
  id: number;
  pubDate: string;
  title: string;
  text: string;
  images: string[]; // URIs
  video: string | null; // URI
  orgs: number[];
}

export interface NewsRaw {
  id: number;
  title: string;
  text: string;
  attachments: {
    image: string; // URI
  }[];
  video: string | null; // URI
  organization: number[];
  pub_date: string; // date
}

export const toNews = (r: NewsRaw): News => ({
  ...R.pick(r, ["id", "title", "text", "video"]),
  images: r.attachments.map(({ image }) => image),
  orgs: r.organization,
  pubDate: r.pub_date,
});
