import { tokenFetch } from "@/features/auth/hooks";
import { AuthState } from "@/features/auth/slice";

export interface NewsInfo {
  title: string;
  text: string;
  datetime: string;
  imgs: string[];
}

export const publishNews = async (
  { token, orgId }: AuthState,
  { title, text, datetime, imgs }: NewsInfo,
) => {
  const res = await tokenFetch(token, "/news/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      text,
      organization: [orgId],
      pub_date: datetime,
      attachments: imgs.map((img) => ({ image: img.slice("data:".length) })),
    }),
  });
  if (res.status !== 201) {
    throw new Error(`error posting news: ${res.status} ${res.statusText}`);
  }
};
