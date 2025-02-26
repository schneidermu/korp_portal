import { Number, Option } from "effect";

import { useTokenFetcher } from "@/auth/slice";
import { User } from "@/user/types";
import { mutate } from "swr";

export const useUpdateRating = () => {
  const tokenFetch = useTokenFetcher();

  return async (user: User, rating: Option.Option<number>) => {
    const key = `/colleagues/${user.id}/`;

    const deleteRating = async () =>
      tokenFetch(`/colleagues/${user.id}/rate/`, { method: "DELETE" }).then(
        (res) => {
          if (res.status >= 400) {
            mutate(key, user, { revalidate: false });
          }
        },
      );

    const postRating = async (rating: number) =>
      tokenFetch(`/colleagues/${user.id}/rate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate: rating }),
      }).then((res) => {
        if (res.status >= 400) {
          mutate(key, user, { revalidate: false });
        }
      });

    let num = user.numRates;
    let sum = Option.map(user.avgRating, (r) => r * num).pipe(
      Option.getOrElse(() => 0),
    );

    if (Option.isSome(user.myRating)) {
      num -= 1;
      sum -= user.myRating.value;
    }

    if (Option.isSome(rating)) {
      num += 1;
      sum += rating.value;
    }

    const avgRating = Number.divide(sum, num);

    mutate(
      key,
      {
        ...user,
        myRating: rating,
        numRates: num,
        avgRating,
      },
      { revalidate: false },
    );

    if (Option.isSome(user.myRating)) {
      await deleteRating();
    }

    if (Option.isSome(rating)) {
      return postRating(rating.value);
    }
  };
};
