import { useEffect, useState } from "react";

import { Option } from "effect";

import { RatingGroup } from "@chakra-ui/react";

import { useAuth } from "@/features/auth/slice";
import { User } from "@/features/user/types";
import { useUpdateRating } from "../services";

export const Rating = ({ user }: { user: User }) => {
  const { userId } = useAuth();
  const updateRating = useUpdateRating();

  const readOnly = user.id === userId;
  const [stars, setStars] = useState(readOnly ? user.avgRating : user.myRating);

  useEffect(() => {
    setStars(readOnly ? user.avgRating : user.myRating);
  }, [readOnly, user.avgRating, user.myRating]);

  const rating = Option.map(
    user.avgRating,
    (r) => r.toFixed(1).replace(".", ",") + ` / ${user.numRates}`,
  );

  return (
    <RatingGroup.Root
      gap="2"
      alignItems="center"
      count={5}
      colorPalette="yellow"
      size="lg"
      readOnly={user.id === userId}
      value={Option.getOrElse(stars, () => 0)}
      onValueChange={({ value }) => {
        const s =
          value === Option.getOrNull(stars)
            ? Option.none()
            : Option.some(value);
        setStars(s);
        updateRating(user, s).catch(() => setStars(stars));
      }}
    >
      <RatingGroup.HiddenInput />
      <RatingGroup.Control gap="1" />
      <RatingGroup.Label>{Option.getOrUndefined(rating)}</RatingGroup.Label>
    </RatingGroup.Root>
  );
};
