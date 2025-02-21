import { Number, Option } from "effect";

import { useTokenFetcher } from "@/auth/slice";
import { UpdateUserFn, User } from "@/user/types";

export const useUpdateRating = ({
  user,
  updateUser,
}: {
  user: User;
  updateUser: UpdateUserFn;
}) => {
  const tokenFetch = useTokenFetcher();

  const deleteRating = async () =>
    tokenFetch(`/colleagues/${user.id}/rate/`, { method: "DELETE" }).then(
      (res) => {
        if (res.status >= 400) {
          updateUser(user);
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
        updateUser(user);
      }
    });

  return async (rating: Option.Option<number>) => {
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

    const avgRating = Number.divide(sum, num).pipe(Option.map(Number.round(1)));

    updateUser({
      ...user,
      myRating: rating,
      numRates: num,
      avgRating,
    });

    if (Option.isSome(user.myRating)) {
      await deleteRating();
    }

    if (Option.isSome(rating)) {
      return postRating(rating.value);
    }
  };
};
