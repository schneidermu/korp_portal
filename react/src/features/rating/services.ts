import { Number, Option } from "effect";
import { mutate } from "swr";

import { useTokenFetcher } from "@/features/auth/hooks";
import { User } from "@/features/user/types";

class RatingUpdateError extends Error {
  user: User;
  rating: Option.Option<number>;

  constructor(user: User, rating: Option.Option<number>, statusText: string) {
    super(
      `HTTP ${statusText} while setting rating ${Option.getOrNull(rating)} for ${user.username}`,
    );
    this.name = "RatingUpdateError";
    this.user = user;
    this.rating = rating;
  }
}

export const useUpdateRating = () => {
  const tokenFetch = useTokenFetcher();

  return async (user: User, rating: Option.Option<number>) => {
    const key = `/colleagues/${user.id}/`;

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

    const res = await Option.match(rating, {
      onSome: (rate) =>
        Option.match(user.myRating, {
          onNone: () =>
            tokenFetch(`/colleagues/${user.id}/rate/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ rate }),
            }),
          onSome: () =>
            tokenFetch(`/colleagues/${user.id}/rate/`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ rate }),
            }),
        }),
      onNone: () =>
        tokenFetch(`/colleagues/${user.id}/rate/`, {
          method: "DELETE",
        }),
    });

    if (res.status >= 400) {
      mutate(key, user, { revalidate: false });
      throw new RatingUpdateError(user, rating, res.statusText);
    }
  };
};
