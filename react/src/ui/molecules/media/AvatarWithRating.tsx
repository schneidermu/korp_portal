import * as R from "radashi";

import { css } from "@styled-system/css";
import { Box, BoxProps, Center } from "@styled-system/jsx";

import { User } from "@api/user/types";

import { Avatar } from "@ui/atoms/media";
import { CircularProgress } from "@ui/atoms/progress";

export const AvatarWithRating = ({
  user,
  ...rest
}: { user: User } & BoxProps) => {
  const rating = user.avgRating ?? 0;

  return (
    <Box position="relative" w={24} h={24} {...rest}>
      <CircularProgress
        className={css({ color: "Corporate/Accent" })}
        bgColor="#e0e0e0"
        progress={rating / 5}
        thickness={0.16}
      />
      <Center top="0" left="0" w="full" h="full" position="absolute">
        <Avatar user={user} w="4.5rem" h="4.5rem" />
        <RatingBadge rating={rating} />
      </Center>
    </Box>
  );
};

const RatingBadge = ({ rating, ...rest }: { rating: number } & BoxProps) => {
  const phi = (2 * Math.PI) / 11;
  const x = 50 + 50 * Math.cos(phi);
  const y = 50 + 50 * Math.sin(phi);

  const s = R.round(rating, 1).toFixed(1).replace(".", ",");

  return (
    <Box
      position="absolute"
      transform="translate(-50%, -50%)"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      bg="white"
      fontSize="body/S"
      color="Corporate/Accent"
      borderWidth="3px"
      borderColor="currentcolor"
      borderRadius="full"
      px={3}
      py={1}
      {...rest}
    >
      {s}
    </Box>
  );
};
