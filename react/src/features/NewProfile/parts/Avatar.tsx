import React from "react";

import { Option as O } from "effect";

import { Avatar as ChakraAvatar, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { User } from "@/features/user/types";
import { resolveMediaPath } from "@/shared/utils";

export interface AvatarProps extends ChakraAvatar.RootProps {
  user: User;
  fallbackSrc: string;
}

export const Avatar = React.memo(
  React.forwardRef<HTMLDivElement, AvatarProps>(function Avatar(props, ref) {
    const { user, fallbackSrc, ...rest } = props;

    const src = O.map(user.photo, resolveMediaPath);

    return (
      <ChakraAvatar.Root asChild ref={ref} w="32" h="32" {...rest}>
        <Link to={`/new-profile/${user.id}`}>
          <ChakraAvatar.Image src={O.getOrUndefined(src)} w="full" h="full" />
          <ChakraAvatar.Fallback w="full" h="full">
            <Image src={fallbackSrc} w="full" h="full" />
          </ChakraAvatar.Fallback>
        </Link>
      </ChakraAvatar.Root>
    );
  }),
);
