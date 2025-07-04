import React, { useRef, useState } from "react";

import { Option as O } from "effect";

import Cropper, { Area } from "react-easy-crop";

import {
  AspectRatio,
  Box,
  BoxProps,
  Avatar as ChakraAvatar,
  Field,
  FieldRootProps,
  IconButton,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { ACCEPT_IMAGES } from "@/app/const";

import { User } from "@/features/user/types";
import { resolveMediaPath } from "@/shared/utils";
import { cropImg } from "@/shared/utils/cropImg";

import { FileInput } from "@/shared/comps/FileInput";

import { LuPencil, LuSave, LuUpload } from "react-icons/lu";
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
      <AspectRatio w="full" ref={ref} {...rest}>
        <Link
          style={{ display: "block", width: "100%", height: "100%" }}
          to={`/profile/${user.id}`}
        >
          <ChakraAvatar.Root w="full" h="full">
            <ChakraAvatar.Image
              src={O.getOrElse(src, () =>
                user.sex === "female" ? femaleAvatar : maleAvatar,
              )}
              w="full"
              h="full"
              borderWidth={1}
              borderColor="gray.1"
              data-state="open"
              _open={{ animation: "fade-in 300ms ease-out" }}
            />
          </ChakraAvatar.Root>
        </Link>
      </AspectRatio>
    );
  }),
);

export const AvatarEditable = React.memo(
  React.forwardRef<HTMLDivElement, AvatarEditableProps>(
    function AvatarEditable(props, ref) {
      const [editing, setEditing] = useState(false);
      const [crop, setCrop] = useState({ x: 0, y: 0 });
      const [zoom, setZoom] = useState(1);

      const { user, onUpload, ...rest } = props;

      const src = O.map(user.photo, resolveMediaPath);

      const area = useRef<Area>({ x: 0, y: 0, height: 0, width: 0 });

      if (!editing) {
        return (
          <Box w="full" h="full" position="relative" ref={ref}>
            <Avatar user={user} {...rest} />
            <IconButton
              variant="ghost"
              minW={0}
              w={6}
              h={6}
              color="black"
              cursor="pointer"
              position="absolute"
              bottom={0}
              right={0}
              onClick={() => setEditing(true)}
            >
              <LuPencil />
            </IconButton>
          </Box>
        );
      }

      return (
        <Box ref={ref} w="32" h="32" position="relative" {...rest}>
          <Box
            w="full"
            h="full"
            borderRadius="full"
            overflow="hidden"
            position="relative"
          >
            <Box asChild w="full" h="full">
              <Cropper
                cropShape="round"
                image={O.getOrUndefined(src)}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, a) => (area.current = a)}
              />
            </Box>
          </Box>
          <IconButton
            variant="ghost"
            minW={0}
            w={6}
            h={6}
            color="black"
            cursor="pointer"
            position="absolute"
            bottom={0}
            left={0}
          >
            <Field.Root w="fit">
              <Field.Label>
                <FileInput accept={ACCEPT_IMAGES} onUpload={onUpload} />
                <LuUpload />
              </Field.Label>
            </Field.Root>
          </IconButton>
          <IconButton
            variant="ghost"
            minW={0}
            w={6}
            h={6}
            color="black"
            cursor="pointer"
            position="absolute"
            bottom={0}
            right={0}
            onClick={async () => {
              const img = await cropImg(
                O.getOrElse(src, () => ""),
                area.current,
              );
              setEditing(false);
              onUpload(img);
              setZoom(1);
              setCrop({ x: 0, y: 0 });
              O.map(src, URL.revokeObjectURL);
            }}
          >
            <LuSave />
          </IconButton>
        </Box>
      );
    },
  ),
);
