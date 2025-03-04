import { useState } from "react";

import clsx from "clsx/lite";
import { Option } from "effect";

import { useAuth } from "@/features/auth/slice";
import { User } from "@/features/user/types";
import { useUpdateRating } from "../services";

import { Icon } from "@/shared/comps/Icon";

import starYellowIcon from "@/assets/star-yellow.svg";
import starIcon from "@/assets/star.svg";

const Stars = ({
  stars,
  onRate,
  disabled = false,
  small,
}: {
  stars: Option.Option<number>;
  onRate: (rate: Option.Option<number>) => void;
  disabled?: boolean;
  small: boolean;
}) => {
  const [hoverStars, setHoverStars] = useState(Option.none<number>());

  const numStars = Option.getOrElse(hoverStars, () =>
    Option.getOrElse(stars, () => 0),
  );

  return (
    <div
      className={clsx(
        "w-fit flex",
        disabled || "cursor-pointer",
        small ? "gap-[14px]" : "gap-[10px]",
      )}
      onMouseLeave={() => setHoverStars(Option.none())}
    >
      {[...Array(5)].map((_, i) => {
        const n = i + 1;
        const icon = n <= numStars ? starYellowIcon : starIcon;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() =>
              onRate(Option.contains(stars, n) ? Option.none() : Option.some(n))
            }
            onMouseEnter={() => setHoverStars(Option.some(n))}
          >
            {small ? (
              <Icon src={icon} width="17px" height="17px" />
            ) : (
              <Icon src={icon} width="29px" height="29px" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export const Rating = ({
  user,
  small = false,
}: {
  user: User;
  small?: boolean;
}) => {
  const { userId } = useAuth();
  const updateRating = useUpdateRating();

  const rating = Option.map(
    user.avgRating,
    (r) => r.toFixed(1).replace(".", ",") + ` / ${user.numRates}`,
  );

  const stars = user.id !== userId ? user.myRating : user.avgRating;

  return (
    <div className="flex gap-[10px] items-center">
      <Stars
        stars={stars}
        disabled={user.id === userId}
        onRate={(rating) => updateRating(user, rating)}
        small={small}
      />
      <div className={clsx(small || "text-[20px]")}>
        {Option.getOrUndefined(rating)}
      </div>
    </div>
  );
};
