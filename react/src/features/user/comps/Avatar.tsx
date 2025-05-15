import React from "react";

import { Option as O } from "effect";

import {
  Box,
  BoxProps,
  Avatar as ChakraAvatar,
  Field,
  FieldRootProps,
  Image,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { ACCEPT_IMAGES } from "@/app/const";

import { User } from "@/features/user/types";
import { resolveMediaPath } from "@/shared/utils";

import { FileInput } from "@/shared/comps/FileInput";

import femaleAvatar from "/avatar/female.png";
import maleAvatar from "/avatar/male.png";

export interface AvatarProps extends BoxProps {
  user: User;
}

export interface AvatarEditableProps extends FieldRootProps {
  user: User;
  onUpload: (src: string) => void;
}

export const Avatar = React.memo(
  React.forwardRef<HTMLDivElement, AvatarProps>(function Avatar(props, ref) {
    const { user, ...rest } = props;

    const src = O.map(user.photo, resolveMediaPath);

    return (
      <Box w="32" h="32" ref={ref} {...rest}>
        <Link to={`/profile/${user.id}`}>
          <ChakraAvatar.Root w="full" h="full">
            <ChakraAvatar.Image
              src={O.getOrUndefined(src)}
              w="full"
              h="full"
              borderWidth={1}
              borderColor="gray.1"
              data-state="open"
              _open={{ animation: "fade-in 300ms ease-out" }}
            />
            <ChakraAvatar.Fallback w="full" h="full" overflow="hidden">
              <Image
                src={user.sex === "female" ? femaleAvatar : maleAvatar}
                w="full"
                h="full"
              />
            </ChakraAvatar.Fallback>
          </ChakraAvatar.Root>
        </Link>
      </Box>
    );
  }),
);

export const AvatarEditable = React.memo(
  React.forwardRef<HTMLDivElement, AvatarEditableProps>(
    function AvatarEditable(props, ref) {
      const { user, onUpload, ...rest } = props;

      const src = O.map(user.photo, resolveMediaPath);

      return (
        <Field.Root ref={ref} w="32" h="32" {...rest}>
          <Field.Label w="full" h="full">
            <FileInput accept={ACCEPT_IMAGES} onUpload={onUpload} />
            <ChakraAvatar.Root w="full" h="full">
              <ChakraAvatar.Image
                src={O.getOrUndefined(src)}
                w="full"
                h="full"
                borderWidth={1}
                borderColor="gray.1"
              />
              <ChakraAvatar.Fallback w="full" h="full" overflow="hidden">
                <Image
                  src={user.sex === "female" ? femaleAvatar : maleAvatar}
                  w="full"
                  h="full"
                />
              </ChakraAvatar.Fallback>
            </ChakraAvatar.Root>
          </Field.Label>
        </Field.Root>
      );
    },
  ),
);
