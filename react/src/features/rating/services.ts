import { Number, Option } from "effect";
import { mutate } from "swr";

import { useTokenFetcher } from "@/features/auth/hooks";
import { User } from "@/features/user/types";

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
        tokenFetch(`/colleagues/${user.id}/rate/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rate }),
        }),
      onNone: () =>
        tokenFetch(`/colleagues/${user.id}/rate/`, {
          method: "DELETE",
        }),
    });

    if (res.status >= 400) {
      mutate(key, user, { revalidate: false });
    }
  };
};
