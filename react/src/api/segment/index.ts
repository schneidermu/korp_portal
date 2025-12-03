import useSWR, { mutate } from "swr";

import { tokenFetch, useTokenFetcher } from "@legacy/features/auth/hooks";

import { APIError } from "@api/common/errors";

import { Segment, toSegment } from "./types";
import { produce } from "immer";

export const useFetchSegments = () => {
  const tokenFetcher = useTokenFetcher();

  return useSWR<Segment[]>(`/segments/`, async (path: string) =>
    tokenFetcher(path)
      .then((res) => {
        if (res.status !== 200) {
          throw new APIError(`fetching segments`, res);
        }
        return res.json();
      })
      .then((rs) => rs.map(toSegment)),
  );
};

const toggleFavoriteSegmentCached = (id: number) =>
  mutate(
    `/segments/`,
    (segments?: Segment[]) => {
      if (!segments) return;
      return produce(segments, (segments) => {
        for (const s of segments) {
          if (s.id === id) {
            s.isFavorite = !s.isFavorite;
            return;
          }
        }
      });
    },
    { revalidate: false },
  );

// TODO: update cache with POST response
export const toggleFavoriteSegment = async (token: string, id: number) => {
  toggleFavoriteSegmentCached(id);
  return tokenFetch(token, `/favorite-segments/toggle/${id}/`, {
    method: "POST",
  })
    .then((res) => {
      if (res.status !== 200 && res.status !== 201) {
        throw new APIError(`toggling segment ${id}'s favorite mark`, res);
      }
      return res.json();
    })
    .catch((err) => {
      toggleFavoriteSegmentCached(id);
      throw err;
    });
};
