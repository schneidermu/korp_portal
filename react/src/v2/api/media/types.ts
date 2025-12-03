import { BACKEND_PREFIX } from "@/app/const";

/**
 * A URL-addressable media with possibly name and extension.
 */
export interface Media {
  /** Relative backend media path or blob URL. */
  url: string;
  name?: string;
  ext?: string;
}

/**
 * Free media if it's a blob.
 */
export const freeMedia = (media: Media) => {
  if (isBlobMedia(media)) {
    URL.revokeObjectURL(media.url);
  }
};

export const mediaAbsoluteURL = (media: Media) => {
  let url = media.url;
  if (url.startsWith("blob:")) {
    return url;
  }
  try {
    url = new URL(url).pathname;
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
  }
  if (url.startsWith("/media")) {
    return BACKEND_PREFIX + url;
  }
  return url;
};

export const toBlobMedia = (file: File) => {
  const name = file.name;
  const ext = name.split(".").slice(-1)[0] ?? null;

  return {
    url: URL.createObjectURL(file),
    name,
    ext,
  };
};

export const isBlobMedia = (media: Media) => {
  return media.url.startsWith("blob:");
};
