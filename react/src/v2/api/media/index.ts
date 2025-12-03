import { tokenFetch } from "@/features/auth/hooks";

import { freeMedia, isBlobMedia, Media } from "./types";

export const uploadMedia = async (token: string, media: Media) => {
  if (!isBlobMedia(media)) return media;

  const blob = await fetch(media.url).then((res) => res.blob());
  const formData = new FormData();
  const timestamp = new Date().getTime();
  const name = `${timestamp}.${media.ext ?? "txt"}`;
  formData.append("file", blob, name);

  const url = await tokenFetch(token, `/upload-file/`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then(({ file }) => decodeURI(file));

  freeMedia(media);

  return { ...media, url };
};
